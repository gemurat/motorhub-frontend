import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

interface QueryParams {
  storeId?: string
  productId?: string
  lowStock?: string
  warehouseOnly?: string
  status?: string
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
      storeId: searchParams.get('storeId') || undefined,
      productId: searchParams.get('productId') || undefined,
      lowStock: searchParams.get('lowStock') || undefined,
      warehouseOnly: searchParams.get('warehouseOnly') || undefined,
      status: searchParams.get('status') || 'ACTIVE',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sortBy: searchParams.get('sortBy') || 'id',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
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
      status: params.status || 'ACTIVE',
    }

    // Use store_id and product_id indexes for filtering
    if (params.storeId) {
      where.store_id = parseInt(params.storeId)
    }
    if (params.productId) {
      where.product_id = parseInt(params.productId)
    }

    // Use warehouse index for filtering
    if (params.warehouseOnly === 'true') {
      where.Store = {
        is_warehouse: true,
      }
    }

    // Use quantity index for low stock filtering
    if (params.lowStock === 'true') {
      where.AND = [
        { quantity: { not: 0 } },
        { min_stock: { not: 0 } },
        {
          quantity: {
            lt: 10, // Simplified low stock threshold
          },
        },
      ]
    }

    // Define valid sort fields
    const validSortFields = [
      'id',
      'store_id',
      'product_id',
      'quantity',
      'min_stock',
      'max_stock',
      'status',
      'created_at',
      'updated_at',
    ] as const
    type SortField = (typeof validSortFields)[number]

    // Validate sort field
    const sortField = validSortFields.includes(params.sortBy as SortField)
      ? (params.sortBy as SortField)
      : 'id'

    // Fetch inventory with pagination and sorting
    const [inventory, total] = await Promise.all([
      prisma.storeInventory.findMany({
        where,
        include: {
          Store: true,
          Products: true,
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

    // Calculate summary information
    const summary = {
      total_items: total,
      low_stock_items: await prisma.storeInventory.count({
        where: {
          ...where,
          AND: [
            { quantity: { not: 0 } },
            { min_stock: { not: 0 } },
            {
              quantity: {
                lt: 10, // Simplified low stock threshold
              },
            },
          ],
        },
      }),
      out_of_stock_items: await prisma.storeInventory.count({
        where: {
          ...where,
          quantity: 0,
        },
      }),
      total_warehouse_items: await prisma.storeInventory.count({
        where: {
          ...where,
          Store: {
            is_warehouse: true,
          },
        },
      }),
    }

    // Cache the response
    const response = {
      summary,
      inventory,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }

    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching store inventory:', error)
    return NextResponse.json(
      {
        error: 'Error fetching store inventory',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.store_id || !data.product_id) {
      return NextResponse.json(
        { error: 'Store ID and Product ID are required' },
        { status: 400 }
      )
    }

    // Check for existing inventory
    const existingInventory = await prisma.storeInventory.findFirst({
      where: {
        store_id: data.store_id,
        product_id: data.product_id,
      },
    })

    if (existingInventory) {
      return NextResponse.json(
        { error: 'Inventory record already exists for this store and product' },
        { status: 409 }
      )
    }

    // Create inventory record
    const inventory = await prisma.storeInventory.create({
      data: {
        ...data,
        status: 'ACTIVE',
        quantity: data.quantity || 0,
        min_stock: data.min_stock || 0,
        reserved_quantity: 0,
      },
    })

    // Invalidate cache
    cache.clear()

    return NextResponse.json(inventory, { status: 201 })
  } catch (error) {
    console.error('Error creating store inventory:', error)
    return NextResponse.json(
      {
        error: 'Failed to create store inventory',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const {
      id,
      quantity,
      min_stock,
      max_stock,
      is_warehouse,
      reserved_quantity,
    } = data

    // Validate input
    if (!id || quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the inventory to update
    const existingInventory = await prisma.storeInventory.findUnique({
      where: { id },
    })

    if (!existingInventory) {
      return NextResponse.json(
        { error: 'Inventory not found' },
        { status: 404 }
      )
    }

    // Update inventory
    const inventory = await prisma.storeInventory.update({
      where: { id },
      data: {
        quantity,
        min_stock: min_stock ?? existingInventory.min_stock,
        max_stock: max_stock ?? existingInventory.max_stock,
        is_warehouse: is_warehouse ?? existingInventory.is_warehouse,
        reserved_quantity:
          reserved_quantity ?? existingInventory.reserved_quantity,
      },
      include: {
        Products: true,
        Store: true,
        StoreInventoryBatch: {
          include: {
            ProductBatches: true,
          },
        },
      },
    })

    // Clear cache for this store's inventory
    const cacheKeys = Array.from(cache.keys())
    cacheKeys.forEach((key) => {
      if (key.includes(`store_id:${existingInventory.store_id}`)) {
        cache.delete(key)
      }
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Error updating store inventory:', error)
    return NextResponse.json(
      {
        error: 'Error updating store inventory',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
