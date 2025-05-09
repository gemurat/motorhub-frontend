import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

interface QueryParams {
  product_id?: string
  from_store_id?: string
  to_store_id?: string
  type?: string
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
      product_id: searchParams.get('product_id') || undefined,
      from_store_id: searchParams.get('from_store_id') || undefined,
      to_store_id: searchParams.get('to_store_id') || undefined,
      type: searchParams.get('type') || undefined,
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
    const where: Prisma.StockMovementsWhereInput = {}

    // Use product_id index
    if (params.product_id) {
      where.product_id = parseInt(params.product_id)
    }

    // Use from_store_id and to_store_id indexes
    if (params.from_store_id || params.to_store_id) {
      where.OR = []
      if (params.from_store_id) {
        where.OR.push({ from_store_id: parseInt(params.from_store_id) })
      }
      if (params.to_store_id) {
        where.OR.push({ to_store_id: parseInt(params.to_store_id) })
      }
    }

    // Use type filter
    if (params.type) {
      where.type = params.type
    }

    // Use status filter
    const status = searchParams.get('status')
    if (status) {
      where.status = status
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
      'product_id',
      'from_store_id',
      'to_store_id',
      'quantity',
      'type',
      'created_at',
    ] as const
    type SortField = (typeof validSortFields)[number]

    // Validate sort field
    const sortField = validSortFields.includes(params.sortBy as SortField)
      ? (params.sortBy as SortField)
      : 'created_at'

    // Fetch movements with pagination and sorting
    const [movements, total] = await Promise.all([
      prisma.stockMovements.findMany({
        where,
        include: {
          Products: {
            select: {
              id: true,
              internal_code: true,
              description: true,
            },
          },
          FromStore: {
            select: {
              id: true,
              name: true,
            },
          },
          ToStore: {
            select: {
              id: true,
              name: true,
            },
          },
          CreatedBy: {
            select: {
              id: true,
              username: true,
            },
          },
          StoreInventory: {
            select: {
              id: true,
              quantity: true,
              store_id: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortField]: params.sortOrder,
        },
      }),
      prisma.stockMovements.count({ where }),
    ])

    // Calculate summary information
    const summary = {
      total_movements: total,
      total_quantity: movements.reduce((sum, m) => sum + m.quantity, 0),
      by_type: await prisma.stockMovements.groupBy({
        by: ['type'],
        _count: true,
        where,
      }),
      by_store: await prisma.stockMovements.groupBy({
        by: ['from_store_id', 'to_store_id'],
        _count: true,
        where,
      }),
    }

    // Cache the response
    const response = {
      summary,
      movements,
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
    console.error('Error fetching stock movements:', error)
    return NextResponse.json(
      {
        error: 'Error fetching stock movements',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { productId, fromStoreId, toStoreId, quantity, type, notes } = data

    // Validate input
    if (!productId || !quantity || !type) {
      return NextResponse.json(
        { error: 'Product ID, quantity, and type are required' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      )
    }

    // Handle stock movement in a transaction
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Get current inventory records using indexes
        const fromInventory = fromStoreId
          ? await tx.storeInventory.findUnique({
              where: {
                store_id_product_id: {
                  store_id: fromStoreId,
                  product_id: productId,
                },
              },
            })
          : null

        const toInventory = toStoreId
          ? await tx.storeInventory.findUnique({
              where: {
                store_id_product_id: {
                  store_id: toStoreId,
                  product_id: productId,
                },
              },
            })
          : null

        // Validate stock availability
        if (fromInventory && fromInventory.quantity < quantity) {
          throw new Error('Insufficient stock in source store')
        }

        // Update source store inventory
        if (fromInventory) {
          await tx.storeInventory.update({
            where: {
              store_id_product_id: {
                store_id: fromStoreId!,
                product_id: productId,
              },
            },
            data: {
              quantity: {
                decrement: quantity,
              },
            },
          })
        }

        // Update or create target store inventory
        if (toStoreId) {
          if (toInventory) {
            await tx.storeInventory.update({
              where: {
                store_id_product_id: {
                  store_id: toStoreId,
                  product_id: productId,
                },
              },
              data: {
                quantity: {
                  increment: quantity,
                },
              },
            })
          } else {
            await tx.storeInventory.create({
              data: {
                store_id: toStoreId,
                product_id: productId,
                quantity: quantity,
                min_stock: 0,
              },
            })
          }
        }

        // Record the movement
        const movement = await tx.stockMovements.create({
          data: {
            product_id: productId,
            from_store_id: fromStoreId,
            to_store_id: toStoreId,
            quantity: quantity,
            type: type,
            notes: notes,
            created_by: 1, // TODO: Get from auth
          },
        })

        // Check for stock alerts
        if (toInventory) {
          const updatedToInventory = await tx.storeInventory.findUnique({
            where: {
              store_id_product_id: {
                store_id: toStoreId!,
                product_id: productId,
              },
            },
          })

          if (updatedToInventory) {
            // Check for low stock alert
            if (
              updatedToInventory.min_stock !== null &&
              updatedToInventory.quantity <= updatedToInventory.min_stock
            ) {
              await tx.stockAlerts.create({
                data: {
                  store_id: toStoreId!,
                  product_id: productId,
                  type: 'LOW_STOCK',
                  status: 'PENDING',
                },
              })
            }

            // Check for overstock alert
            if (
              updatedToInventory.max_stock &&
              updatedToInventory.quantity > updatedToInventory.max_stock
            ) {
              await tx.stockAlerts.create({
                data: {
                  store_id: toStoreId!,
                  product_id: productId,
                  type: 'OVERSTOCK',
                  status: 'PENDING',
                },
              })
            }
          }
        }

        return movement
      }
    )

    // Invalidate cache
    cache.clear()

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error processing stock movement:', error)
    return NextResponse.json(
      {
        error: 'Error processing stock movement',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const movementId = searchParams.get('id')
    const data = await request.json()
    const { status } = data

    if (!movementId) {
      return NextResponse.json(
        { error: 'Movement ID is required' },
        { status: 400 }
      )
    }

    if (!status || !['COMPLETED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (COMPLETED or REJECTED) is required' },
        { status: 400 }
      )
    }

    // Handle stock movement update in a transaction
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Get the movement
        const movement = await tx.stockMovements.findUnique({
          where: { id: parseInt(movementId) },
          include: {
            Products: true,
            FromStore: true,
            ToStore: true,
          },
        })

        if (!movement) {
          throw new Error('Stock movement not found')
        }

        if (movement.status !== 'PENDING') {
          throw new Error('Only pending movements can be updated')
        }

        // If rejecting, just update the status
        if (status === 'REJECTED') {
          return await tx.stockMovements.update({
            where: { id: parseInt(movementId) },
            data: { status },
          })
        }

        // For approval (COMPLETED), we need to update inventories
        if (movement.from_store_id) {
          // Update source store inventory
          await tx.storeInventory.update({
            where: {
              store_id_product_id: {
                store_id: movement.from_store_id,
                product_id: movement.product_id,
              },
            },
            data: {
              quantity: {
                decrement: movement.quantity,
              },
            },
          })
        }

        if (movement.to_store_id) {
          // Update or create target store inventory
          const toInventory = await tx.storeInventory.findUnique({
            where: {
              store_id_product_id: {
                store_id: movement.to_store_id,
                product_id: movement.product_id,
              },
            },
          })

          if (toInventory) {
            await tx.storeInventory.update({
              where: {
                store_id_product_id: {
                  store_id: movement.to_store_id,
                  product_id: movement.product_id,
                },
              },
              data: {
                quantity: {
                  increment: movement.quantity,
                },
              },
            })
          } else {
            await tx.storeInventory.create({
              data: {
                store_id: movement.to_store_id,
                product_id: movement.product_id,
                quantity: movement.quantity,
                min_stock: 0,
              },
            })
          }

          // Check for stock alerts
          const updatedToInventory = await tx.storeInventory.findUnique({
            where: {
              store_id_product_id: {
                store_id: movement.to_store_id,
                product_id: movement.product_id,
              },
            },
          })

          if (updatedToInventory) {
            // Check for low stock alert
            if (
              updatedToInventory.min_stock !== null &&
              updatedToInventory.quantity <= updatedToInventory.min_stock
            ) {
              await tx.stockAlerts.create({
                data: {
                  store_id: movement.to_store_id,
                  product_id: movement.product_id,
                  type: 'LOW_STOCK',
                  status: 'PENDING',
                },
              })
            }

            // Check for overstock alert
            if (
              updatedToInventory.max_stock &&
              updatedToInventory.quantity > updatedToInventory.max_stock
            ) {
              await tx.stockAlerts.create({
                data: {
                  store_id: movement.to_store_id,
                  product_id: movement.product_id,
                  type: 'OVERSTOCK',
                  status: 'PENDING',
                },
              })
            }
          }
        }

        // Update the movement status
        return await tx.stockMovements.update({
          where: { id: parseInt(movementId) },
          data: { status },
        })
      }
    )

    // Invalidate cache
    cache.clear()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating stock movement:', error)
    return NextResponse.json(
      {
        error: 'Error updating stock movement',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
