import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

interface QueryParams {
  store_id?: string
  product_id?: string
  type?: string
  status?: string
  start_date?: string
  end_date?: string
  page?: string
  limit?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Helper function to check if cache is valid
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL
}

// Helper function to generate cache key
function generateCacheKey(params: QueryParams): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const params: QueryParams = {
      store_id: searchParams.get('store_id') || undefined,
      product_id: searchParams.get('product_id') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    }

    // Check cache first
    const cacheKey = generateCacheKey(params)
    const cachedData = cache.get(cacheKey)
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return NextResponse.json(cachedData.data)
    }

    // Validate and parse pagination parameters
    const page = Math.max(1, parseInt(params.page || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(params.limit || '10')))
    const skip = (page - 1) * limit

    // Build query conditions using indexes
    const where: Prisma.StockAlertsWhereInput = {}

    // Use store_id and product_id filters
    if (params.store_id) {
      where.store_id = parseInt(params.store_id)
    }
    if (params.product_id) {
      where.product_id = parseInt(params.product_id)
    }

    // Use status index
    if (params.status) {
      where.status = params.status
    }

    // Use type filter
    if (params.type) {
      where.type = params.type
    }

    // Use created_at index for date range filtering
    if (params.start_date || params.end_date) {
      where.created_at = {}
      if (params.start_date) {
        where.created_at.gte = new Date(params.start_date)
      }
      if (params.end_date) {
        where.created_at.lte = new Date(params.end_date)
      }
    }

    // Define valid sort fields
    const validSortFields = [
      'id',
      'store_id',
      'product_id',
      'type',
      'status',
      'created_at',
      'resolved_at',
    ] as const
    type SortField = (typeof validSortFields)[number]

    // Validate sort field
    const sortField = validSortFields.includes(params.sortBy as SortField)
      ? (params.sortBy as SortField)
      : 'created_at'

    // Fetch alerts with pagination and sorting
    const [alerts, total] = await Promise.all([
      prisma.stockAlerts.findMany({
        where,
        include: {
          Products: true,
          Store: true,
          StoreInventory: true,
        },
        skip,
        take: limit,
        orderBy: {
          [sortField]: params.sortOrder,
        },
      }),
      prisma.stockAlerts.count({ where }),
    ])

    const response = {
      alerts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }

    // Cache the response
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching stock alerts:', error)
    return NextResponse.json(
      {
        error: 'Error fetching stock alerts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { store_id, product_id, type, status } = data

    // Validate input
    if (!store_id || !product_id || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if alert already exists
    const existingAlert = await prisma.stockAlerts.findFirst({
      where: {
        store_id,
        product_id,
      },
    })

    let alert
    if (existingAlert) {
      // Update existing alert
      alert = await prisma.stockAlerts.update({
        where: {
          id: existingAlert.id,
        },
        data: {
          type,
          status: status || 'PENDING',
          resolved_at: status === 'RESOLVED' ? new Date() : null,
        },
        include: {
          Products: true,
          Store: true,
          StoreInventory: true,
        },
      })
    } else {
      // Create new alert
      alert = await prisma.stockAlerts.create({
        data: {
          store_id,
          product_id,
          type,
          status: status || 'PENDING',
        },
        include: {
          Products: true,
          Store: true,
          StoreInventory: true,
        },
      })
    }

    // Clear cache for this store's alerts
    const cacheKeys = Array.from(cache.keys())
    cacheKeys.forEach((key) => {
      if (key.includes(`store_id:${store_id}`)) {
        cache.delete(key)
      }
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error creating stock alert:', error)
    return NextResponse.json(
      {
        error: 'Error creating stock alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const { store_id, product_id, status } = data

    // Validate input
    if (!store_id || !product_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the alert to update
    const existingAlert = await prisma.stockAlerts.findFirst({
      where: {
        store_id,
        product_id,
      },
    })

    if (!existingAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Update alert status
    const alert = await prisma.stockAlerts.update({
      where: {
        id: existingAlert.id,
      },
      data: {
        status,
        resolved_at: status === 'RESOLVED' ? new Date() : null,
      },
      include: {
        Products: true,
        Store: true,
        StoreInventory: true,
      },
    })

    // Clear cache for this store's alerts
    const cacheKeys = Array.from(cache.keys())
    cacheKeys.forEach((key) => {
      if (key.includes(`store_id:${store_id}`)) {
        cache.delete(key)
      }
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error updating stock alert:', error)
    return NextResponse.json(
      {
        error: 'Error updating stock alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
