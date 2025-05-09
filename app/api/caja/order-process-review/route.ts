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

type OrderItemWithProduct = Prisma.OrderItemsGetPayload<{
  include: {
    Products: true
  }
}>

export async function GET() {
  try {
    // Get orders IN REVIEW status with their items and seller info
    const orders = await prisma.orders.findMany({
      where: {
        status: 'IN REVIEW',
      },
      include: {
        OrderItems: {
          include: {
            Products: true,
          },
        },
        Users: true,
        Clients: true,
      },
    })

    // Format the response
    const formattedOrders = orders.map((order: OrderWithRelations) => ({
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
    }))

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Error fetching orders' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, newStatus, completed } = await request.json()

    if (!orderId || !newStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Start a transaction
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Update order status
        const updatedOrder = await tx.orders.update({
          where: { id: orderId },
          data: {
            status: newStatus,
            payment_status: completed ? 'PAID' : 'PENDING',
          },
        })

        // 2. Create order history entry
        await tx.orderHistory.create({
          data: {
            order_id: orderId,
            status: newStatus,
            created_by: parseInt(session.user.sub),
            notes: `Order status updated to ${newStatus}`,
          },
        })

        // 3. If completed, update inventory
        if (completed) {
          // Get order items
          const orderItems = await tx.orderItems.findMany({
            where: { order_id: orderId },
          })

          // Update inventory for each item
          for (const item of orderItems) {
            if (!item.product_id || !item.quantity) continue

            // Get store ID from the order
            const order = await tx.orders.findUnique({
              where: { id: orderId },
              select: { store_id: true },
            })

            if (!order?.store_id) continue

            // Update store inventory
            await tx.storeInventory.updateMany({
              where: {
                store_id: order.store_id,
                product_id: item.product_id,
              },
              data: {
                quantity: {
                  decrement: item.quantity,
                },
                available_stock: {
                  decrement: item.quantity,
                },
              },
            })
          }
        }

        return updatedOrder
      }
    )

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      order: result,
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Error updating order' }, { status: 500 })
  }
}
