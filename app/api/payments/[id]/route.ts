import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'

const prisma = new PrismaClient()

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the database user based on Auth0 email
    const dbUser = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    const paymentId = params.id
    const data = await request.json()
    const { status, rejection_reason } = data

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (APPROVED or REJECTED) is required' },
        { status: 400 }
      )
    }

    // Handle payment update in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the payment
      const payment = await tx.payments.findUnique({
        where: { id: parseInt(paymentId) },
        include: {
          Orders: true,
          PaymentMethods: true,
        },
      })

      console.log('Found payment:', {
        id: payment?.id,
        status: payment?.status,
        order_id: payment?.order_id,
      })

      if (!payment) {
        throw new Error('Payment not found')
      }

      // Make status check case-insensitive and handle both formats
      const currentStatus = payment.status.toUpperCase()
      console.log('Normalized status:', currentStatus)
      if (currentStatus !== 'IN REVIEW') {
        console.log('Current payment status:', payment.status)
        throw new Error(
          `Only payments IN REVIEW can be updated. Current status: ${payment.status}`
        )
      }

      // Update the payment status
      const updatedPayment = await tx.payments.update({
        where: { id: parseInt(paymentId) },
        data: {
          status,
          rejection_reason: status === 'REJECTED' ? rejection_reason : null,
          approval_date: status === 'APPROVED' ? new Date() : null,
          approved_by: status === 'APPROVED' ? dbUser.id : null,
        },
      })

      // If payment is approved, update order status
      if (status === 'APPROVED') {
        // Update the order status
        await tx.orders.update({
          where: { id: payment.order_id },
          data: {
            status: 'APPROVED',
            payment_status: 'PAID',
          },
        })

        // Create order history entry
        await tx.orderHistory.create({
          data: {
            order_id: payment.order_id,
            status: 'APPROVED',
            created_by: dbUser.id,
            notes: 'Payment approved and order approved',
          },
        })
      } else if (status === 'REJECTED') {
        // Create order history entry for rejected payment
        await tx.orderHistory.create({
          data: {
            order_id: payment.order_id,
            status: 'REJECTED',
            created_by: dbUser.id,
            notes: `Payment rejected${rejection_reason ? `: ${rejection_reason}` : ''}`,
          },
        })
      }

      return updatedPayment
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      {
        error: 'Error updating payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
