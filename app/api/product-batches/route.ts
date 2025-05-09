import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

interface QueryParams {
  product_id?: string
  batch_number?: string
  expiry_date?: string
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
      product_id: searchParams.get('product_id') || undefined,
      batch_number: searchParams.get('batch_number') || undefined,
      expiry_date: searchParams.get('expiry_date') || undefined,
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
    const where: Prisma.ProductBatchesWhereInput = {}

    if (params.product_id) {
      where.product_id = parseInt(params.product_id)
    }

    if (params.batch_number) {
      where.batch_number = params.batch_number
    }

    if (params.expiry_date) {
      where.expiry_date = new Date(params.expiry_date)
    }

    // Define valid sort fields
    const validSortFields = [
      'id',
      'product_id',
      'batch_number',
      'expiry_date',
      'cost_price',
      'created_at',
    ] as const
    type SortField = (typeof validSortFields)[number]

    // Validate sort field
    const sortField = validSortFields.includes(params.sortBy as SortField)
      ? (params.sortBy as SortField)
      : 'created_at'

    // Fetch batches with pagination and sorting
    const [batches, total] = await Promise.all([
      prisma.productBatches.findMany({
        where,
        include: {
          Products: true,
          StoreInventoryBatch: {
            include: {
              StoreInventory: {
                include: {
                  Store: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortField]: params.sortOrder,
        },
      }),
      prisma.productBatches.count({ where }),
    ])

    // Calculate summary information
    const summary = {
      total_batches: total,
      expired_batches: await prisma.productBatches.count({
        where: {
          ...where,
          expiry_date: { lt: new Date() },
        },
      }),
      average_cost: await prisma.productBatches.aggregate({
        where,
        _avg: {
          cost_price: true,
        },
      }),
      cost_range: await prisma.productBatches.aggregate({
        where,
        _min: {
          cost_price: true,
        },
        _max: {
          cost_price: true,
        },
      }),
      by_product: await prisma.productBatches.groupBy({
        by: ['product_id'],
        _count: true,
        where,
      }),
    }

    const response = {
      summary,
      batches,
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
    console.error('Error fetching product batches:', error)
    return NextResponse.json(
      {
        error: 'Error fetching product batches',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { product_id, batch_number, expiry_date, cost_price } = data

    // Validate input
    if (!product_id || !batch_number || cost_price === undefined) {
      return NextResponse.json(
        { error: 'Product ID, batch number, and cost price are required' },
        { status: 400 }
      )
    }

    if (cost_price <= 0) {
      return NextResponse.json(
        { error: 'Cost price must be greater than 0' },
        { status: 400 }
      )
    }

    // Check for existing batch number
    const existingBatch = await prisma.productBatches.findFirst({
      where: {
        product_id,
        batch_number,
      },
    })

    if (existingBatch) {
      return NextResponse.json(
        { error: 'Batch number already exists for this product' },
        { status: 409 }
      )
    }

    // Create new batch
    const batch = await prisma.productBatches.create({
      data: {
        product_id,
        batch_number,
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        cost_price,
      },
      include: {
        Products: true,
        StoreInventoryBatch: {
          include: {
            StoreInventory: {
              include: {
                Store: true,
              },
            },
          },
        },
      },
    })

    // Invalidate cache
    cache.clear()

    return NextResponse.json(batch, { status: 201 })
  } catch (error) {
    console.error('Error creating product batch:', error)
    return NextResponse.json(
      {
        error: 'Error creating product batch',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const { id, batch_number, expiry_date, cost_price } = data

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      )
    }

    if (cost_price !== undefined && cost_price <= 0) {
      return NextResponse.json(
        { error: 'Cost price must be greater than 0' },
        { status: 400 }
      )
    }

    // Find the batch to update
    const existingBatch = await prisma.productBatches.findUnique({
      where: { id },
    })

    if (!existingBatch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    // Check for duplicate batch number if being updated
    if (batch_number && batch_number !== existingBatch.batch_number) {
      const duplicateBatch = await prisma.productBatches.findFirst({
        where: {
          product_id: existingBatch.product_id,
          batch_number,
        },
      })

      if (duplicateBatch) {
        return NextResponse.json(
          { error: 'Batch number already exists for this product' },
          { status: 409 }
        )
      }
    }

    // Update batch
    const batch = await prisma.productBatches.update({
      where: { id },
      data: {
        batch_number,
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        cost_price,
      },
      include: {
        Products: true,
        StoreInventoryBatch: {
          include: {
            StoreInventory: {
              include: {
                Store: true,
              },
            },
          },
        },
      },
    })

    // Invalidate cache
    cache.clear()

    return NextResponse.json(batch)
  } catch (error) {
    console.error('Error updating product batch:', error)
    return NextResponse.json(
      {
        error: 'Error updating product batch',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
