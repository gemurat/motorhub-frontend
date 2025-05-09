import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const result = await prisma.payments.groupBy({
      by: ['payment_method_id'],
      where: {
        status: 'APPROVED',
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    })

    // Get payment method names
    const paymentMethods = await prisma.paymentMethods.findMany({
      where: {
        id: {
          in: result.map((r) => r.payment_method_id),
        },
      },
    })

    // Map the results to include payment method names
    const formattedResult = result.map((item) => {
      const paymentMethod = paymentMethods.find(
        (pm) => pm.id === item.payment_method_id
      )
      return {
        payment_method: paymentMethod?.name || 'Unknown',
        payment_count: item._count.id,
        total_amount: item._sum.amount || 0,
      }
    })

    return NextResponse.json(formattedResult)
  } catch (error) {
    console.error('Error fetching sales data:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
