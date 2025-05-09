import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Get all store inventory for the product
    const storeInventory = await prisma.storeInventory.findMany({
      where: {
        product_id: parseInt(productId),
        status: 'ACTIVE',
      },
      include: {
        Store: {
          select: {
            id: true,
            name: true,
            is_warehouse: true,
          },
        },
        Products: {
          select: {
            id: true,
            internal_code: true,
            description: true,
            price: true,
          },
        },
      },
      orderBy: {
        Store: {
          is_warehouse: 'desc', // Show warehouse first
        },
      },
    })

    // Calculate total stock
    const totalStock = storeInventory.reduce(
      (sum, item) => sum + item.quantity,
      0
    )

    // Calculate total reserved
    const totalReserved = storeInventory.reduce(
      (sum, item) => sum + item.reserved_quantity,
      0
    )

    return NextResponse.json({
      product: storeInventory[0]?.Products,
      total_stock: totalStock,
      total_reserved: totalReserved,
      store_inventory: storeInventory.map((item) => ({
        store_id: item.store_id,
        store_name: item.Store.name,
        is_warehouse: item.Store.is_warehouse,
        quantity: item.quantity,
        reserved_quantity: item.reserved_quantity,
        min_stock: item.min_stock,
        max_stock: item.max_stock,
        available_stock: item.available_stock,
      })),
    })
  } catch (error) {
    console.error('Error fetching product stock:', error)
    return NextResponse.json(
      {
        error: 'Error fetching product stock',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
