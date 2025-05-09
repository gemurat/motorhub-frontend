import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

interface QueryParams {
  store_id?: string
  product_id?: string
  start_date?: string
  end_date?: string
  active_only?: string
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
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      active_only: searchParams.get('active_only') || 'true',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sortBy: searchParams.get('sortBy') || 'start_date',
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
    const where: Prisma.StoreProductPricingWhereInput = {}

    // Use store_id and product_id filters
    if (params.store_id) {
      where.store_id = parseInt(params.store_id)
    }
    if (params.product_id) {
      where.product_id = parseInt(params.product_id)
    }

    // Handle date range filtering
    if (params.start_date || params.end_date) {
      where.start_date = {}
      if (params.start_date) {
        where.start_date.gte = new Date(params.start_date)
      }
      if (params.end_date) {
        where.start_date.lte = new Date(params.end_date)
      }
    }

    // Handle active pricing filter
    if (params.active_only === 'true') {
      where.OR = [{ end_date: null }, { end_date: { gt: new Date() } }]
    }

    // Define valid sort fields
    const validSortFields = [
      'id',
      'store_id',
      'product_id',
      'price',
      'start_date',
      'end_date',
    ] as const
    type SortField = (typeof validSortFields)[number]

    // Validate sort field
    const sortField = validSortFields.includes(params.sortBy as SortField)
      ? (params.sortBy as SortField)
      : 'start_date'

    // Fetch pricing with pagination and sorting
    const [pricing, total] = await Promise.all([
      prisma.storeProductPricing.findMany({
        where,
        include: {
          Products: true,
          Store: true,
        },
        skip,
        take: limit,
        orderBy: {
          [sortField]: params.sortOrder,
        },
      }),
      prisma.storeProductPricing.count({ where }),
    ])

    // Calculate summary information
    const summary = {
      total_pricing: total,
      active_pricing: await prisma.storeProductPricing.count({
        where: {
          ...where,
          OR: [{ end_date: null }, { end_date: { gt: new Date() } }],
        },
      }),
      average_price: await prisma.storeProductPricing.aggregate({
        where,
        _avg: {
          price: true,
        },
      }),
      price_range: await prisma.storeProductPricing.aggregate({
        where,
        _min: {
          price: true,
        },
        _max: {
          price: true,
        },
      }),
      by_store: await prisma.storeProductPricing.groupBy({
        by: ['store_id'],
        _count: true,
        where,
      }),
    }

    const response = {
      summary,
      pricing,
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
    console.error('Error fetching store product pricing:', error)
    return NextResponse.json(
      {
        error: 'Error fetching store product pricing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { store_id, product_id, price, start_date, end_date } = data

    // Validate input
    if (!store_id || !product_id || price === undefined) {
      return NextResponse.json(
        { error: 'Store ID, Product ID, and price are required' },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // Check for existing active pricing
    const existingPricing = await prisma.storeProductPricing.findFirst({
      where: {
        store_id,
        product_id,
        OR: [{ end_date: null }, { end_date: { gt: new Date() } }],
      },
    })

    if (existingPricing) {
      // End the existing pricing
      await prisma.storeProductPricing.update({
        where: {
          id: existingPricing.id,
        },
        data: {
          end_date: new Date(),
        },
      })
    }

    // Create new pricing
    const pricing = await prisma.storeProductPricing.create({
      data: {
        store_id,
        product_id,
        price,
        start_date: start_date ? new Date(start_date) : new Date(),
        end_date: end_date ? new Date(end_date) : null,
      },
      include: {
        Products: true,
        Store: true,
      },
    })

    // Invalidate cache
    cache.clear()

    return NextResponse.json(pricing, { status: 201 })
  } catch (error) {
    console.error('Error creating store product pricing:', error)
    return NextResponse.json(
      {
        error: 'Error creating store product pricing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const { id, price, end_date } = data

    // Validate input
    if (!id || price === undefined) {
      return NextResponse.json(
        { error: 'ID and price are required' },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // Find the pricing to update
    const existingPricing = await prisma.storeProductPricing.findUnique({
      where: { id },
    })

    if (!existingPricing) {
      return NextResponse.json(
        { error: 'Pricing record not found' },
        { status: 404 }
      )
    }

    // Update pricing
    const pricing = await prisma.storeProductPricing.update({
      where: { id },
      data: {
        price,
        end_date: end_date ? new Date(end_date) : null,
      },
      include: {
        Products: true,
        Store: true,
      },
    })

    // Invalidate cache
    cache.clear()

    return NextResponse.json(pricing)
  } catch (error) {
    console.error('Error updating store product pricing:', error)
    return NextResponse.json(
      {
        error: 'Error updating store product pricing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
