import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

interface QueryParams {
  store_inventory_id?: string
  batch_id?: string
  min_quantity?: string
  max_quantity?: string
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
      store_inventory_id: searchParams.get('store_inventory_id') || undefined,
      batch_id: searchParams.get('batch_id') || undefined,
      min_quantity: searchParams.get('min_quantity') || undefined,
      max_quantity: searchParams.get('max_quantity') || undefined,
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

    // Build query conditions
    const where: Prisma.StoreInventoryBatchWhereInput = {}

    if (params.store_inventory_id) {
      where.store_inventory_id = parseInt(params.store_inventory_id)
    }

    if (params.batch_id) {
      where.batch_id = parseInt(params.batch_id)
    }

    if (params.min_quantity || params.max_quantity) {
      where.quantity = {}
      if (params.min_quantity) {
        where.quantity.gte = parseInt(params.min_quantity)
      }
      if (params.max_quantity) {
        where.quantity.lte = parseInt(params.max_quantity)
      }
    }

    // Define valid sort fields
    const validSortFields = [
      'id',
      'store_inventory_id',
      'batch_id',
      'quantity',
    ] as const
    type SortField = (typeof validSortFields)[number]

    // Validate sort field
    const sortField = validSortFields.includes(params.sortBy as SortField)
      ? (params.sortBy as SortField)
      : 'quantity'

    // Fetch inventory batches with pagination and sorting
    const [inventoryBatches, total] = await Promise.all([
      prisma.storeInventoryBatch.findMany({
        where,
        include: {
          ProductBatches: {
            include: {
              Products: true,
            },
          },
          StoreInventory: {
            include: {
              Store: true,
              Products: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortField]: params.sortOrder,
        },
      }),
      prisma.storeInventoryBatch.count({ where }),
    ])

    // Calculate summary information
    const summary = {
      total_batches: total,
      total_quantity: await prisma.storeInventoryBatch.aggregate({
        where,
        _sum: {
          quantity: true,
        },
      }),
      average_quantity: await prisma.storeInventoryBatch.aggregate({
        where,
        _avg: {
          quantity: true,
        },
      }),
      quantity_range: await prisma.storeInventoryBatch.aggregate({
        where,
        _min: {
          quantity: true,
        },
        _max: {
          quantity: true,
        },
      }),
      by_store: await prisma.storeInventoryBatch.groupBy({
        by: ['store_inventory_id'],
        _sum: {
          quantity: true,
        },
        where,
      }),
    }

    const response = {
      summary,
      inventoryBatches,
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
    console.error('Error fetching store inventory batches:', error)
    return NextResponse.json(
      {
        error: 'Error fetching store inventory batches',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { store_inventory_id, batch_id, quantity } = data

    // Validate input
    if (!store_inventory_id || !batch_id || quantity === undefined) {
      return NextResponse.json(
        { error: 'Store inventory ID, batch ID, and quantity are required' },
        { status: 400 }
      )
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than or equal to 0' },
        { status: 400 }
      )
    }

    // Check if store inventory exists
    const storeInventory = await prisma.storeInventory.findUnique({
      where: { id: store_inventory_id },
    })

    if (!storeInventory) {
      return NextResponse.json(
        { error: 'Store inventory not found' },
        { status: 404 }
      )
    }

    // Check if batch exists
    const batch = await prisma.productBatches.findUnique({
      where: { id: batch_id },
    })

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    // Check if batch is already assigned to this store inventory
    const existingBatch = await prisma.storeInventoryBatch.findFirst({
      where: {
        store_inventory_id,
        batch_id,
      },
    })

    if (existingBatch) {
      return NextResponse.json(
        { error: 'Batch is already assigned to this store inventory' },
        { status: 409 }
      )
    }

    // Create new inventory batch
    const inventoryBatch = await prisma.storeInventoryBatch.create({
      data: {
        store_inventory_id,
        batch_id,
        quantity,
      },
      include: {
        ProductBatches: {
          include: {
            Products: true,
          },
        },
        StoreInventory: {
          include: {
            Store: true,
            Products: true,
          },
        },
      },
    })

    // Invalidate cache
    cache.clear()

    return NextResponse.json(inventoryBatch, { status: 201 })
  } catch (error) {
    console.error('Error creating store inventory batch:', error)
    return NextResponse.json(
      {
        error: 'Error creating store inventory batch',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const { id, quantity } = data

    // Validate input
    if (!id || quantity === undefined) {
      return NextResponse.json(
        { error: 'ID and quantity are required' },
        { status: 400 }
      )
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than or equal to 0' },
        { status: 400 }
      )
    }

    // Find the inventory batch to update
    const existingBatch = await prisma.storeInventoryBatch.findUnique({
      where: { id },
    })

    if (!existingBatch) {
      return NextResponse.json(
        { error: 'Inventory batch not found' },
        { status: 404 }
      )
    }

    // Update inventory batch
    const inventoryBatch = await prisma.storeInventoryBatch.update({
      where: { id },
      data: {
        quantity,
      },
      include: {
        ProductBatches: {
          include: {
            Products: true,
          },
        },
        StoreInventory: {
          include: {
            Store: true,
            Products: true,
          },
        },
      },
    })

    // Invalidate cache
    cache.clear()

    return NextResponse.json(inventoryBatch)
  } catch (error) {
    console.error('Error updating store inventory batch:', error)
    return NextResponse.json(
      {
        error: 'Error updating store inventory batch',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
