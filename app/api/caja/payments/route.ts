import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'
import { Prisma } from '@prisma/client'

interface Payment {
  amount: string | number
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, paymentMethodId, amount, giftcardId } = body

    // Validate required fields
    if (!orderId || !paymentMethodId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate payment method exists
    const paymentMethod = await prisma.paymentMethods.findUnique({
      where: { id: paymentMethodId },
    })

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    // Get the order with all related data
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        Payments: true,
        OrderItems: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validate order status
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Order is not in PENDING status' },
        { status: 400 }
      )
    }

    // Calculate total paid amount
    const totalPaid = order.Payments.reduce(
      (sum: number, payment: { amount: Prisma.Decimal }) =>
        sum + Number(payment.amount.toString()),
      0
    )

    // Check if payment would exceed order total
    if (totalPaid + Number(amount) > Number(order.total_amount)) {
      return NextResponse.json(
        { error: 'Payment amount exceeds order total' },
        { status: 400 }
      )
    }

    // Process payment in a transaction
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Create payment record
        const payment = await tx.payments.create({
          data: {
            order_id: orderId,
            payment_method_id: paymentMethodId,
            amount: amount,
            date: new Date(),
            status: paymentMethod.requires_approval ? 'PENDING' : 'APPROVED',
            approved_by: paymentMethod.requires_approval
              ? null
              : parseInt(session.user.sub),
            approval_date: paymentMethod.requires_approval ? null : new Date(),
          },
        })

        // Update order status if fully paid
        const newTotalPaid = totalPaid + Number(amount)
        if (newTotalPaid >= Number(order.total_amount)) {
          await tx.orders.update({
            where: { id: orderId },
            data: {
              payment_status: 'PAID',
              status: 'COMPLETED',
              OrderHistory: {
                create: {
                  status: 'COMPLETED',
                  created_by: parseInt(session.user.sub),
                  notes: 'Order completed and fully paid',
                },
              },
            },
          })
        } else {
          // Update order history for partial payment
          await tx.orderHistory.create({
            data: {
              order_id: orderId,
              status: 'PARTIAL_PAYMENT',
              created_by: parseInt(session.user.sub),
              notes: `Partial payment received: ${new Intl.NumberFormat(
                'es-AR',
                {
                  style: 'currency',
                  currency: 'ARS',
                }
              ).format(Number(amount))}`,
            },
          })
        }

        return payment
      }
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Error processing payment' },
      { status: 500 }
    )
  }
}
