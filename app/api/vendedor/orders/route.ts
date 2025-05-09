import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'
import { Prisma } from '@prisma/client'

interface OrderItem {
  id: number
  cantidad: number
  price: number
}

interface OrderResponse {
  id: number
  status: string
  customer_id: string | null
  customer_name?: string | null
  seller_id: number | null
  seller_name?: string | null
  order_date: Date | null
  total_amount: number | null
  items: {
    product_id: number | null
    product_name?: string | null
    quantity: number | null
    price: number | null
  }[]
}

export const GET = async () => {
  try {
    const pendingOrders = await prisma.orders.findMany({
      where: {
        status: {
          in: ['PENDING', 'APPROVED', 'IN REVIEW'],
        },
      },
      include: {
        OrderItems: {
          include: {
            Products: true,
          },
        },
        Users: {
          select: {
            username: true,
          },
        },
        Clients: {
          select: {
            name: true,
          },
        },
      },
    })

    const orders: OrderResponse[] = pendingOrders.map((order) => ({
      id: order.id,
      status: order.status,
      customer_id: order.customer_id,
      customer_name: order.Clients?.name,
      seller_id: order.seller_id,
      seller_name: order.Users?.username,
      order_date: order.order_date,
      total_amount: order.total_amount ? Number(order.total_amount) : null,
      items: order.OrderItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.Products?.description,
        quantity: item.quantity,
        price: item.price ? Number(item.price) : null,
      })),
    }))

    return NextResponse.json({ success: true, orders }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { customerId, items, total_amount } = body

    // Validate required fields
    if (!customerId || !items || !total_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the current user's store ID and user ID
    const user = await prisma.users.findUnique({
      where: { auth0_id: session.user.sub },
      select: { store_id: true, id: true },
    })

    if (!user?.store_id || !user?.id) {
      return NextResponse.json(
        { error: 'User not properly configured' },
        { status: 400 }
      )
    }

    const storeId = user.store_id
    const userId = user.id

    // Validate stock availability before creating the order
    for (const item of items) {
      const inventory = await prisma.storeInventory.findUnique({
        where: {
          store_id_product_id: {
            store_id: storeId,
            product_id: item.id,
          },
        },
      })

      if (!inventory || inventory.quantity < item.cantidad) {
        return NextResponse.json(
          { error: `Insufficient stock for product ID: ${item.id}` },
          { status: 400 }
        )
      }
    }

    // Create or find client
    let clientId = customerId
    if (!customerId.startsWith('CLI-')) {
      // If it's not a UUID, create a new client
      const newClient = await prisma.clients.create({
        data: {
          name: customerId,
        },
      })
      clientId = newClient.id
    }

    // Create the order in a transaction to ensure data consistency
    const order = await prisma.$transaction(async (tx) => {
      // First create the order
      const newOrder = await tx.orders.create({
        data: {
          store_id: storeId,
          customer_id: clientId,
          total_amount: new Prisma.Decimal(total_amount),
          status: 'PENDING',
          payment_status: 'PENDING',
          order_type: 'REGULAR',
          seller_id: userId,
          order_date: new Date(),
          OrderItems: {
            create: items.map((item: OrderItem) => ({
              product_id: item.id,
              quantity: item.cantidad,
              price: new Prisma.Decimal(item.price),
            })),
          },
        },
      })

      // Then create the order history
      await tx.orderHistory.create({
        data: {
          order_id: newOrder.id,
          status: 'PENDING',
          notes: 'Order created',
          created_by: userId,
        },
      })

      // Update product stock
      for (const item of items) {
        await tx.storeInventory.update({
          where: {
            store_id_product_id: {
              store_id: storeId,
              product_id: item.id,
            },
          },
          data: {
            quantity: {
              decrement: item.cantidad,
            },
          },
        })
      }

      return newOrder
    })

    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully',
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error creating order', details: error },
      { status: 500 }
    )
  }
}
