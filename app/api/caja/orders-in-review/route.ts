import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'
import type { Prisma } from '@prisma/client'

interface OrderResponse {
  id: number
  status: string
  customer_id: string
  seller_id: number
  seller_name?: string
  order_date: Date
  total_amount: number
  items: {
    product_id: number
    product_name?: string
    quantity: number
    price: number
  }[]
  payments: {
    id: number
    amount: number
    status: string
    payment_method: {
      id: number
      name: string
    }
  }[]
}

type OrderWithRelations = Prisma.OrdersGetPayload<{
  include: {
    OrderItems: {
      include: {
        Products: true
      }
    }
    Users: true
    Clients: true
  }
}>

export const GET = async () => {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const orders = await prisma.orders.findMany({
      where: {
        status: {
          in: ['IN REVIEW', 'APPROVED'],
        },
      },
      include: {
        OrderItems: {
          include: {
            Products: true,
          },
        },
        Users: true,
        Clients: true,
        Payments: {
          include: {
            PaymentMethods: true,
          },
        },
      },
    })

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      status: order.status,
      customer_id: order.customer_id || 'N/A',
      customer_name: order.Clients?.name || 'N/A',
      seller_name: order.Users?.username || 'N/A',
      order_date: order.order_date,
      total_amount: Number(order.total_amount) || 0,
      items: order.OrderItems.map((item) => ({
        product_id: item.product_id || 0,
        product_name: item.Products?.description || 'N/A',
        quantity: item.quantity || 0,
        price: Number(item.price) || 0,
      })),
      payments: order.Payments.map((payment) => ({
        id: payment.id,
        amount: Number(payment.amount),
        status: payment.status,
        payment_method: {
          id: payment.PaymentMethods.id,
          name: payment.PaymentMethods.name,
        },
      })),
    }))

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error('Error fetching orders IN REVIEW:', error)
    return NextResponse.json(
      { error: 'Error fetching orders IN REVIEW' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')
    const action = searchParams.get('action')

    if (!orderId || !action) {
      return NextResponse.json(
        { error: 'Missing orderId or action parameter' },
        { status: 400 }
      )
    }

    if (action !== 'complete') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get the user from the database
    const user = await prisma.users.findUnique({
      where: { auth0_id: session.user.sub },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Update the order status in a transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update the order status
      const order = await tx.orders.update({
        where: {
          id: parseInt(orderId),
        },
        data: {
          status: 'COMPLETED',
          payment_status: 'COMPLETED',
        },
      })

      // Create order history entry
      await tx.orderHistory.create({
        data: {
          order_id: order.id,
          status: 'COMPLETED',
          notes: 'Order completed by cashier',
          created_by: user.id,
        },
      })

      return order
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order completed successfully',
    })
  } catch (error) {
    console.error('Error completing order:', error)
    return NextResponse.json(
      { error: 'Error completing order', details: error },
      { status: 500 }
    )
  }
}
