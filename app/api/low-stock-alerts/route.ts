import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

interface QueryParams {
  store_id?: string
  product_id?: string
  status?: string
  is_warehouse?: string
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
      status: searchParams.get('status') || 'ACTIVE',
      is_warehouse: searchParams.get('is_warehouse') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sortBy: searchParams.get('sortBy') || 'quantity',
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
    const where: Prisma.StoreInventoryWhereInput = {
      AND: [{ quantity: { gt: 0 } }, { min_stock: { gt: 0 } }],
    }

    // Use status index for filtering
    if (params.status) {
      where.status = params.status
    }

    // Use is_warehouse index for filtering
    if (params.is_warehouse !== undefined) {
      where.Store = {
        is_warehouse: params.is_warehouse === 'true',
      }
    }

    // Use store_id and product_id filters
    if (params.store_id) {
      where.store_id = parseInt(params.store_id)
    }
    if (params.product_id) {
      where.product_id = parseInt(params.product_id)
    }

    // Define valid sort fields
    const validSortFields = [
      'id',
      'store_id',
      'product_id',
      'quantity',
      'min_stock',
      'status',
      'reserved_quantity',
    ] as const
    type SortField = (typeof validSortFields)[number]

    // Validate sort field
    const sortField = validSortFields.includes(params.sortBy as SortField)
      ? (params.sortBy as SortField)
      : 'quantity'

    // Fetch inventory items
    const [inventory, total] = await Promise.all([
      prisma.storeInventory.findMany({
        where,
        include: {
          Products: {
            select: {
              id: true,
              internal_code: true,
              description: true,
              price: true,
            },
          },
          Store: {
            select: {
              id: true,
              name: true,
              is_warehouse: true,
            },
          },
          StoreInventoryBatch: {
            include: {
              ProductBatches: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortField]: params.sortOrder,
        },
      }),
      prisma.storeInventory.count({ where }),
    ])

    // Filter and process low stock items
    const lowStockItems = inventory.filter(
      (item) => item.quantity <= item.min_stock
    )
    const alerts = lowStockItems.map((item) => ({
      ...item,
      alert_severity: calculateAlertSeverity(item.quantity, item.min_stock),
      days_until_out_of_stock: calculateDaysUntilOutOfStock(
        item.quantity,
        item.min_stock
      ),
    }))

    const response = {
      alerts,
      pagination: {
        total: alerts.length,
        page,
        limit,
        totalPages: Math.ceil(alerts.length / limit),
      },
    }

    // Cache the response
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching low stock alerts:', error)
    return NextResponse.json(
      {
        error: 'Error fetching low stock alerts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Helper function to calculate alert severity
function calculateAlertSeverity(
  quantity: number,
  minStock: number
): 'HIGH' | 'MEDIUM' | 'LOW' {
  const ratio = quantity / minStock
  if (ratio <= 0.5) return 'HIGH'
  if (ratio <= 0.75) return 'MEDIUM'
  return 'LOW'
}

// Helper function to estimate days until out of stock
function calculateDaysUntilOutOfStock(
  quantity: number,
  minStock: number
): number {
  // This is a simplified calculation - in a real system, you might want to use
  // historical sales data or other metrics to make this more accurate
  const dailyUsage = minStock / 30 // Assuming min_stock is for 30 days
  return Math.floor(quantity / dailyUsage)
}
