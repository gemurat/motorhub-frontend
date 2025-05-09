import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'

const prisma = new PrismaClient()

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

type StoreInventoryWithStore = Prisma.StoreInventoryGetPayload<{
  include: {
    Store: true
    StoreInventoryBatch: {
      include: {
        ProductBatches: true
      }
    }
  }
}>

type ProductWithInventory = Prisma.ProductsGetPayload<{
  include: {
    StoreInventory: {
      include: {
        Store: true
        StoreInventoryBatch: {
          include: {
            ProductBatches: true
          }
        }
      }
    }
  }
}>

interface StoreStockInfo {
  store_id: number
  store_name: string
  quantity: number
  min_stock: number | null
  max_stock: number | null
  reserved_quantity: number
  is_warehouse: boolean
  status: string
  batches: {
    batch_number: string
    quantity: number
    expiry_date: Date | null
    cost_price: number
  }[]
}

interface MappedProduct {
  id: number
  internal_code: string
  description: string | null
  price: number
  status: string
  store_stock: StoreStockInfo[]
  total_stock: number
  warehouse_stock: number
  selected_store_stock: number
  total_reserved: number
  needs_restock: boolean
  overstock: boolean
}

interface InventorySummary {
  total_products: number
  low_stock_items: number
  out_of_stock_items: number
  total_stock_value: number
  total_reserved_value: number
  items_needing_restock: number
  items_overstock: number
}

interface QueryParams {
  storeId?: string
  lowStock?: string
  overstock?: string
  warehouseOnly?: string
  search?: string
  status?: string
  page?: string
  limit?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  userStoreIds?: number[]
  userRole?: string
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
      lowStock: searchParams.get('lowStock') || undefined,
      overstock: searchParams.get('overstock') || undefined,
      warehouseOnly: searchParams.get('warehouseOnly') || undefined,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || 'ACTIVE',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sortBy: searchParams.get('sortBy') || 'id',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    }

    // Get user from session
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's information including assigned store
    const user = await prisma.users.findFirst({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        role: true,
        store_id: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user is a vendedor, use their assigned store
    if (user.role === 'VENDEDOR') {
      if (!user.store_id) {
        return NextResponse.json(
          { error: 'Vendedor must have an assigned store' },
          { status: 400 }
        )
      }

      // Check cache first
      const cacheKey = generateCacheKey({
        ...params,
        storeId: user.store_id.toString(),
        userRole: user.role,
      })
      const cachedData = cache.get(cacheKey)
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        return NextResponse.json(cachedData.data)
      }

      // Build query conditions for vendedor
      const where: Prisma.ProductsWhereInput = {
        status: params.status || 'ACTIVE',
        StoreInventory: {
          some: {
            store_id: user.store_id,
            status: 'ACTIVE',
          },
        },
      }

      // Use internal_code index for search
      if (params.search) {
        where.OR = [
          { internal_code: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
        ]
      }

      // Validate and parse pagination parameters
      const page = Math.max(1, parseInt(params.page || '1'))
      const limit = Math.min(100, Math.max(1, parseInt(params.limit || '10')))
      const skip = (page - 1) * limit

      // Fetch products with pagination and sorting
      const [products, total] = await Promise.all([
        prisma.products.findMany({
          where,
          include: {
            StoreInventory: {
              where: {
                store_id: user.store_id,
                status: 'ACTIVE',
              },
              include: {
                Store: true,
                StoreInventoryBatch: {
                  include: {
                    ProductBatches: true,
                  },
                },
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            [params.sortBy || 'id']: params.sortOrder || 'asc',
          },
        }),
        prisma.products.count({ where }),
      ])

      // Map products for vendedor view
      const mappedProducts: MappedProduct[] = products.map((product) => {
        const storeInventory = product.StoreInventory[0] // Vendedor only sees their store's inventory

        const storeStock: StoreStockInfo[] = [
          {
            store_id: storeInventory.store_id,
            store_name: storeInventory.Store.name,
            quantity: storeInventory.quantity,
            min_stock: storeInventory.min_stock,
            max_stock: storeInventory.max_stock,
            reserved_quantity: storeInventory.reserved_quantity,
            is_warehouse: storeInventory.Store.is_warehouse,
            status: storeInventory.status,
            batches: storeInventory.StoreInventoryBatch.map((batch) => ({
              batch_number: batch.ProductBatches.batch_number,
              quantity: batch.quantity,
              expiry_date: batch.ProductBatches.expiry_date,
              cost_price: Number(batch.ProductBatches.cost_price),
            })),
          },
        ]

        const productPrice = Number(product.price || 0)
        const totalStock = storeInventory.quantity
        const totalReserved = storeInventory.reserved_quantity
        const productValue = productPrice * totalStock
        const reservedValue = productPrice * totalReserved

        const needsRestock =
          storeInventory.quantity < (storeInventory.min_stock || 0)
        const overstock =
          storeInventory.max_stock !== null &&
          storeInventory.quantity > storeInventory.max_stock

        return {
          id: product.id,
          internal_code: product.internal_code || '',
          description: product.description,
          price: productPrice,
          status: product.status,
          store_stock: storeStock,
          total_stock: totalStock,
          warehouse_stock: storeInventory.Store.is_warehouse ? totalStock : 0,
          selected_store_stock: storeInventory.quantity,
          total_reserved: totalReserved,
          needs_restock: needsRestock,
          overstock: overstock,
        }
      })

      // Create summary for vendedor
      const summary: InventorySummary = {
        total_products: total,
        low_stock_items: mappedProducts.filter((p) => p.total_stock < 10)
          .length,
        out_of_stock_items: mappedProducts.filter((p) => p.total_stock === 0)
          .length,
        total_stock_value: mappedProducts.reduce(
          (sum, p) => sum + p.price * p.total_stock,
          0
        ),
        total_reserved_value: mappedProducts.reduce(
          (sum, p) => sum + p.price * p.total_reserved,
          0
        ),
        items_needing_restock: mappedProducts.filter((p) => p.needs_restock)
          .length,
        items_overstock: mappedProducts.filter((p) => p.overstock).length,
      }

      // Apply optional filters
      let filteredProducts = mappedProducts
      if (params.lowStock === 'true') {
        filteredProducts = filteredProducts.filter((p) => p.total_stock < 10)
      }
      if (params.overstock === 'true') {
        filteredProducts = filteredProducts.filter((p) => p.overstock)
      }

      // Cache the response
      const response = {
        summary,
        products: filteredProducts,
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
    }

    // For non-vendedor users, use the existing logic with UserStoreAccess
    const userStoreAccess = await prisma.userStoreAccess.findMany({
      where: {
        user_id: user.id,
        status: 'ACTIVE',
      },
      select: {
        store_id: true,
        role: true,
      },
    })

    // If user has no store access, return empty result
    if (userStoreAccess.length === 0) {
      return NextResponse.json({
        products: [],
        summary: {
          total_products: 0,
          low_stock_items: 0,
          out_of_stock_items: 0,
          total_stock_value: 0,
          total_reserved_value: 0,
          items_needing_restock: 0,
          items_overstock: 0,
        },
      })
    }

    // Get list of store IDs the user has access to
    const userStoreIds = userStoreAccess.map((access) => access.store_id)
    const userRole = userStoreAccess[0].role // Assuming user has at least one store access

    // Check cache first
    const cacheKey = generateCacheKey({ ...params, userStoreIds, userRole })
    const cachedData = cache.get(cacheKey)
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return NextResponse.json(cachedData.data)
    }

    // Validate and parse pagination parameters
    const page = Math.max(1, parseInt(params.page || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(params.limit || '10')))
    const skip = (page - 1) * limit

    // Build query conditions using indexes
    const where: Prisma.ProductsWhereInput = {
      status: params.status || 'ACTIVE',
      StoreInventory: {
        some: {
          store_id: {
            in: userStoreIds,
          },
          status: 'ACTIVE',
        },
      },
    }

    // If user is a vendedor, only show products from their assigned store
    if (userRole === 'VENDEDOR') {
      where.StoreInventory = {
        some: {
          store_id: userStoreIds[0], // Vendedor should only have access to one store
          status: 'ACTIVE',
        },
      }
    }

    // Use internal_code index for search
    if (params.search) {
      where.OR = [
        { internal_code: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    // Use warehouse index for filtering
    if (params.warehouseOnly === 'true') {
      where.StoreInventory = {
        some: {
          Store: {
            is_warehouse: true,
          },
          store_id: {
            in: userStoreIds,
          },
          status: 'ACTIVE',
        },
      }
    }

    // If a specific store is requested, verify user has access to it
    if (params.storeId) {
      const storeId = parseInt(params.storeId)
      if (!userStoreIds.includes(storeId)) {
        return NextResponse.json(
          { error: 'Access denied to requested store' },
          { status: 403 }
        )
      }
      where.StoreInventory = {
        some: {
          store_id: storeId,
          status: 'ACTIVE',
        },
      }
    }

    // Define valid sort fields
    const validSortFields = [
      'id',
      'internal_code',
      'description',
      'price',
      'status',
      'created_at',
      'updated_at',
    ] as const
    type SortField = (typeof validSortFields)[number]

    // Validate sort field
    const sortField = validSortFields.includes(params.sortBy as SortField)
      ? (params.sortBy as SortField)
      : 'id'

    // Fetch products with pagination and sorting
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        include: {
          StoreInventory: {
            include: {
              Store: true,
              StoreInventoryBatch: {
                include: {
                  ProductBatches: true,
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
      prisma.products.count({ where }),
    ])

    // Calculate summary information
    let lowStockCount = 0
    let outOfStockCount = 0
    let totalStockValue = 0
    let totalReservedValue = 0
    let itemsNeedingRestock = 0
    let itemsOverstock = 0

    // Map stock values and calculate summaries
    const mappedProducts: MappedProduct[] = products.map((product) => {
      const storeInventories = product.StoreInventory || []

      // Filter store inventories based on user role
      const filteredStoreInventories =
        userRole === 'VENDEDOR'
          ? storeInventories.filter((inv) => inv.store_id === userStoreIds[0])
          : storeInventories

      const storeStock: StoreStockInfo[] = filteredStoreInventories.map(
        (inv) => ({
          store_id: inv.store_id,
          store_name: inv.Store.name,
          quantity: inv.quantity,
          min_stock: inv.min_stock,
          max_stock: inv.max_stock,
          reserved_quantity: inv.reserved_quantity,
          is_warehouse: inv.Store.is_warehouse,
          status: inv.status,
          batches: inv.StoreInventoryBatch.map((batch) => ({
            batch_number: batch.ProductBatches.batch_number,
            quantity: batch.quantity,
            expiry_date: batch.ProductBatches.expiry_date,
            cost_price: Number(batch.ProductBatches.cost_price),
          })),
        })
      )

      const warehouseInventory = filteredStoreInventories.find(
        (inv) => inv.Store.is_warehouse
      )

      const selectedStoreInventory = params.storeId
        ? filteredStoreInventories.find(
            (inv) => inv.store_id === parseInt(params.storeId!)
          )
        : null

      const totalStock = filteredStoreInventories.reduce(
        (sum, inv) => sum + inv.quantity,
        0
      )
      const totalReserved = filteredStoreInventories.reduce(
        (sum, inv) => sum + inv.reserved_quantity,
        0
      )
      const productPrice = Number(product.price || 0)
      const productValue = productPrice * totalStock
      const reservedValue = productPrice * totalReserved

      // Check if product needs restock (below min_stock) or is overstocked (above max_stock)
      const needsRestock = selectedStoreInventory
        ? selectedStoreInventory.quantity <
          (selectedStoreInventory.min_stock || 0)
        : filteredStoreInventories.some(
            (inv) => inv.quantity < (inv.min_stock || 0)
          )

      const overstock = selectedStoreInventory
        ? selectedStoreInventory.max_stock !== null &&
          selectedStoreInventory.quantity > selectedStoreInventory.max_stock
        : filteredStoreInventories.some(
            (inv) => inv.max_stock !== null && inv.quantity > inv.max_stock
          )

      // Update summary counts
      if (totalStock === 0) {
        outOfStockCount++
      } else if (totalStock < 10) {
        lowStockCount++
      }
      if (needsRestock) {
        itemsNeedingRestock++
      }
      if (overstock) {
        itemsOverstock++
      }
      totalStockValue += productValue
      totalReservedValue += reservedValue

      return {
        id: product.id,
        internal_code: product.internal_code || '',
        description: product.description,
        price: productPrice,
        status: product.status,
        store_stock: storeStock,
        total_stock: totalStock,
        warehouse_stock: warehouseInventory?.quantity || 0,
        selected_store_stock: selectedStoreInventory?.quantity || 0,
        total_reserved: totalReserved,
        needs_restock: needsRestock,
        overstock: overstock,
      }
    })

    // Create summary object
    const summary: InventorySummary = {
      total_products: total,
      low_stock_items: lowStockCount,
      out_of_stock_items: outOfStockCount,
      total_stock_value: totalStockValue,
      total_reserved_value: totalReservedValue,
      items_needing_restock: itemsNeedingRestock,
      items_overstock: itemsOverstock,
    }

    // Apply optional filters
    let filteredProducts = mappedProducts

    if (params.lowStock === 'true') {
      filteredProducts = filteredProducts.filter(
        (product) => product.total_stock < 10
      )
    }

    if (params.overstock === 'true') {
      filteredProducts = filteredProducts.filter((product) => product.overstock)
    }

    // Cache the response
    const response = {
      summary,
      products: filteredProducts,
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
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        error: 'Error fetching products',
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
    if (!data.internal_code || !data.description) {
      return NextResponse.json(
        { error: 'Internal code and description are required' },
        { status: 400 }
      )
    }

    // Check for duplicate internal code
    const existingProduct = await prisma.products.findFirst({
      where: {
        internal_code: data.internal_code,
      },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this internal code already exists' },
        { status: 409 }
      )
    }

    // Create product with empty inventory
    const product = await prisma.products.create({
      data: {
        ...data,
        status: 'ACTIVE',
        StoreInventory: {
          create: [],
        },
      },
    })

    // Attach to warehouse store
    const warehouse = await prisma.store.findFirst({
      where: {
        is_warehouse: true,
        status: 'ACTIVE',
      },
    })

    if (warehouse) {
      await prisma.storeInventory.create({
        data: {
          store_id: warehouse.id,
          product_id: product.id,
          quantity: 0,
          min_stock: 0,
          max_stock: 0,
        },
      })
    }

    // Invalidate cache
    cache.clear()

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      {
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
