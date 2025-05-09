import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
import { Prisma } from '@prisma/client'

export const GET = async () => {
  try {
    const today = new Date()
    const startDate = startOfDay(today)
    const endDate = endOfDay(today)

    // Get all approved payments for today
    const payments = await prisma.payments.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'APPROVED',
      },
      include: {
        PaymentMethods: true,
      },
    })

    // Calculate totals
    const total_sales = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    )
    const total_transactions = new Set(payments.map((p) => p.order_id)).size

    // Group by payment method
    const paymentMethodSummary = payments.reduce(
      (acc, payment) => {
        const methodName = payment.PaymentMethods.name
        if (!acc[methodName]) {
          acc[methodName] = {
            payment_method: methodName,
            total_amount: 0,
            transaction_count: 0,
          }
        }
        acc[methodName].total_amount += Number(payment.amount)
        acc[methodName].transaction_count++
        return acc
      },
      {} as Record<
        string,
        {
          payment_method: string
          total_amount: number
          transaction_count: number
        }
      >
    )

    return NextResponse.json({
      total_sales,
      total_transactions,
      payment_methods: Object.values(paymentMethodSummary),
    })
  } catch (error) {
    console.error('Error fetching daily summary:', error)
    return NextResponse.json(
      { error: 'Error fetching daily summary' },
      { status: 500 }
    )
  }
}
