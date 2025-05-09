import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Payments, GiftCards } from '@/lib/generated/prisma'

export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url)
    const orderId = url.searchParams.get('orderId')

    if (orderId) {
      const payments = await prisma.payments.findMany({
        where: {
          order_id: parseInt(orderId),
          status: 'PENDING',
        },
      })

      if (payments.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No payments found for this order' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { success: true, data: payments },
        { status: 200 }
      )
    }

    // If no orderId is provided, return all gift cards
    const giftCards = await prisma.giftCards.findMany()
    return NextResponse.json(
      { success: true, data: giftCards[0] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
