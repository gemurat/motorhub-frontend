import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'
import { Prisma } from '@prisma/client'

export const POST = async (req: Request) => {
  try {
    const session = await getSession()
    if (!session?.user?.sub) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the user from the database
    const user = await prisma.users.findUnique({
      where: { auth0_id: session.user.sub },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 400 }
      )
    }

    // Process cancellation in a transaction to ensure data consistency
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Get the order with its items and payments
      const order = await tx.orders.findUnique({
        where: { id: orderId },
        include: {
          OrderItems: true,
          Payments: {
            include: {
              PaymentMethods: true,
            },
          },
        },
      })

      if (!order) {
        throw new Error('Order not found')
      }

      // 2. Update all payments to CANCELLED status
      await tx.payments.updateMany({
        where: { order_id: orderId },
        data: { status: 'CANCELLED' },
      })

      // 3. Revert stock changes for each item
      for (const item of order.OrderItems) {
        if (!item.product_id || !item.quantity) continue

        await tx.storeInventory.updateMany({
          where: {
            store_id: order.store_id,
            product_id: item.product_id,
          },
          data: {
            quantity: {
              increment: item.quantity,
            },
            available_stock: {
              increment: item.quantity,
            },
          },
        })
      }

      // 4. Create order history entry
      await tx.orderHistory.create({
        data: {
          order_id: orderId,
          status: 'CANCELLED',
          created_by: user.id,
          notes: 'Order cancelled by user',
        },
      })

      // 5. Update order status
      await tx.orders.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          payment_status: 'CANCELLED',
        },
      })

      // 6. Handle cashbox movements for approved payments
      const approvedPayments = order.Payments.filter(
        (p: { status: string; PaymentMethods: { affects_cashbox: boolean } }) =>
          p.status === 'APPROVED' && p.PaymentMethods.affects_cashbox
      )

      if (approvedPayments.length > 0) {
        const totalAmount = approvedPayments.reduce(
          (sum: number, p: { amount: Prisma.Decimal }) =>
            sum + Number(p.amount.toString()),
          0
        )

        // Update cashbox balance
        await tx.cashBoxes.update({
          where: { id: 1 }, // Assuming default cashbox ID is 1
          data: {
            current_balance: {
              decrement: totalAmount,
            },
            last_updated: new Date(),
          },
        })

        // Create cashbox movement for cancellation
        await tx.cashBoxMovements.create({
          data: {
            cash_box_id: 1,
            store_id: order.store_id,
            type: 'outcome',
            amount: totalAmount,
            description: `Cancellation of order #${orderId}`,
            date: new Date(),
            status: 'APPROVED',
            created_by: user.id,
            approved_by: user.id,
            approval_date: new Date(),
            order_id: orderId,
          },
        })
      }
    })

    return NextResponse.json({ success: true, orderId }, { status: 200 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database error',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
