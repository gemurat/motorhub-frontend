import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

interface QueryParams {
  status?: string
  order_id?: string
  payment_method_id?: string
  start_date?: string
  end_date?: string
  page?: string
  limit?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const params: QueryParams = {
      status: searchParams.get('status') || undefined,
      order_id: searchParams.get('order_id') || undefined,
      payment_method_id: searchParams.get('payment_method_id') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    }

    // Validate and parse pagination parameters
    const page = Math.max(1, parseInt(params.page || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(params.limit || '10')))
    const skip = (page - 1) * limit

    // Build query conditions
    const where: Prisma.PaymentsWhereInput = {}

    if (params.status) {
      // Make status filter case-insensitive and handle both formats
      where.status = {
        equals: params.status.toUpperCase().replace(' ', '_'),
        mode: 'insensitive',
      }
      console.log('Filtering payments by status:', {
        rawStatus: params.status,
        normalizedStatus: params.status.toUpperCase().replace(' ', '_'),
        whereClause: where.status,
      })
    }

    if (params.order_id) {
      where.order_id = parseInt(params.order_id)
    }

    if (params.payment_method_id) {
      where.payment_method_id = parseInt(params.payment_method_id)
    }

    // Use date range filtering
    if (params.start_date || params.end_date) {
      where.date = {}
      if (params.start_date) {
        where.date.gte = new Date(params.start_date)
      }
      if (params.end_date) {
        where.date.lte = new Date(params.end_date)
      }
    }

    // Fetch payments with related data
    const [payments, total] = await Promise.all([
      prisma.payments.findMany({
        where,
        include: {
          Orders: {
            select: {
              id: true,
              total_amount: true,
              order_date: true,
              status: true,
            },
          },
          PaymentMethods: {
            select: {
              id: true,
              name: true,
              requires_approval: true,
            },
          },
          ApprovedBy: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
      prisma.payments.count({ where }),
    ])

    console.log('Found payments:', {
      total,
      status: params.status,
      payments: payments.map((p) => ({
        id: p.id,
        status: p.status,
        amount: p.amount,
        order_id: p.order_id,
        order_status: p.Orders?.status,
      })),
    })

    // Calculate summary information
    const summary = {
      total_payments: total,
      total_amount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      by_status: await prisma.payments.groupBy({
        by: ['status'],
        _count: true,
        where,
      }),
      by_payment_method: await prisma.payments.groupBy({
        by: ['payment_method_id'],
        _count: true,
        where,
      }),
    }

    // Cache the response
    const response = {
      summary,
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      {
        error: 'Error fetching payments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('id')
    const data = await request.json()
    const { status, rejection_reason } = data

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (APPROVED or REJECTED) is required' },
        { status: 400 }
      )
    }

    // Handle payment update in a transaction
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Get the payment
        const payment = await tx.payments.findUnique({
          where: { id: parseInt(paymentId) },
          include: {
            Orders: true,
            PaymentMethods: true,
          },
        })

        if (!payment) {
          throw new Error('Payment not found')
        }

        if (payment.status !== 'IN REVIEW') {
          throw new Error('Only payments IN REVIEW can be updated')
        }

        // Update the payment status
        return await tx.payments.update({
          where: { id: parseInt(paymentId) },
          data: {
            status,
            rejection_reason: status === 'REJECTED' ? rejection_reason : null,
            approval_date: status === 'APPROVED' ? new Date() : null,
            approved_by: status === 'APPROVED' ? 1 : null, // TODO: Get from auth
          },
        })
      }
    )

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
