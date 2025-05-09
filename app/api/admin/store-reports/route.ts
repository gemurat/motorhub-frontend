import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

interface QueryParams {
  store_id?: string
  report_type?: string
  period?: string
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
      report_type: searchParams.get('report_type') || undefined,
      period: searchParams.get('period') || undefined,
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

    // Build query conditions
    const where: Prisma.StoreReportsWhereInput = {}

    // Use store_id filter
    if (params.store_id) {
      where.store_id = parseInt(params.store_id)
    }

    // Use report_type filter
    if (params.report_type) {
      where.report_type = params.report_type
    }

    // Use period filter
    if (params.period) {
      where.period = params.period
    }

    // Use date range filtering
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
      'report_type',
      'period',
      'created_at',
    ] as const
    type SortField = (typeof validSortFields)[number]

    // Validate sort field
    const sortField = validSortFields.includes(params.sortBy as SortField)
      ? (params.sortBy as SortField)
      : 'created_at'

    // Fetch reports with pagination and sorting
    const [reports, total] = await Promise.all([
      prisma.storeReports.findMany({
        where,
        include: {
          Store: true,
        },
        skip,
        take: limit,
        orderBy: {
          [sortField]: params.sortOrder,
        },
      }),
      prisma.storeReports.count({ where }),
    ])

    const response = {
      reports,
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
    console.error('Error fetching store reports:', error)
    return NextResponse.json(
      {
        error: 'Error fetching store reports',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { store_id, report_type, period, data: reportData } = data

    // Validate input
    if (!store_id || !report_type || !period || !reportData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate report based on type
    let reportContent: any
    switch (report_type) {
      case 'INVENTORY_SUMMARY':
        reportContent = await generateInventorySummary(store_id, period)
        break
      case 'STOCK_MOVEMENTS':
        reportContent = await generateStockMovementsReport(store_id, period)
        break
      case 'LOW_STOCK_ALERTS':
        reportContent = await generateLowStockAlerts(store_id)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    // Create report record
    const report = await prisma.storeReports.create({
      data: {
        store_id,
        report_type,
        period,
        data: reportContent,
      },
    })

    // Clear cache for this store's reports
    const cacheKeys = Array.from(cache.keys())
    cacheKeys.forEach((key) => {
      if (key.includes(`store_id:${store_id}`)) {
        cache.delete(key)
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating store report:', error)
    return NextResponse.json(
      {
        error: 'Error generating store report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Helper functions for report generation
async function generateInventorySummary(store_id: number, period: string) {
  const [inventory, totalValue] = await Promise.all([
    prisma.storeInventory.findMany({
      where: {
        store_id,
        status: 'ACTIVE',
      },
      include: {
        Products: true,
        StoreInventoryBatch: {
          include: {
            ProductBatches: true,
          },
        },
      },
    }),
    prisma.storeInventory.aggregate({
      where: {
        store_id,
        status: 'ACTIVE',
      },
      _sum: {
        quantity: true,
      },
    }),
  ])

  return {
    total_items: inventory.length,
    total_quantity: totalValue._sum.quantity || 0,
    items: inventory.map((item) => ({
      product_id: item.product_id,
      product_code: item.Products?.internal_code,
      description: item.Products?.description,
      quantity: item.quantity,
      min_stock: item.min_stock,
      max_stock: item.max_stock,
      batches: item.StoreInventoryBatch.map((batch) => ({
        batch_number: batch.ProductBatches.batch_number,
        quantity: batch.quantity,
        expiry_date: batch.ProductBatches.expiry_date,
      })),
    })),
  }
}

async function generateStockMovementsReport(store_id: number, period: string) {
  const movements = await prisma.stockMovements.findMany({
    where: {
      OR: [{ from_store_id: store_id }, { to_store_id: store_id }],
      created_at: {
        gte: new Date(period),
      },
    },
    include: {
      Products: true,
      FromStore: true,
      ToStore: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  return {
    total_movements: movements.length,
    movements: movements.map((movement) => ({
      id: movement.id,
      product_id: movement.product_id,
      product_code: movement.Products?.internal_code,
      quantity: movement.quantity,
      type: movement.type,
      from_store: movement.FromStore?.name,
      to_store: movement.ToStore?.name,
      date: movement.created_at,
    })),
  }
}

async function generateLowStockAlerts(store_id: number) {
  const alerts = await prisma.stockAlerts.findMany({
    where: {
      store_id,
      status: 'PENDING',
      type: 'LOW_STOCK',
    },
    include: {
      Products: true,
      StoreInventory: true,
    },
  })

  return {
    total_alerts: alerts.length,
    alerts: alerts.map((alert) => ({
      product_id: alert.product_id,
      product_code: alert.Products?.internal_code,
      current_stock: alert.StoreInventory?.quantity,
      min_stock: alert.StoreInventory?.min_stock,
      created_at: alert.created_at,
    })),
  }
}
