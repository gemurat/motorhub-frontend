import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
import { Decimal } from '@prisma/client/runtime/library'

interface SellerSale {
  seller_id: number | null
  _sum: {
    total_amount: Decimal | null
  }
  _count: {
    id: number
  }
}

export async function GET() {
  try {
    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)

    const sellerSales = await prisma.orders.groupBy({
      by: ['seller_id'],
      where: {
        created_at: {
          gte: startOfToday,
          lte: endOfToday,
        },
        status: {
          in: ['COMPLETED', 'PAID'],
        },
      },
      _sum: {
        total_amount: true,
      },
      _count: {
        id: true,
      },
    })

    const sellerDetails = await Promise.all(
      sellerSales.map(async (sale: SellerSale) => {
        if (!sale.seller_id) return null

        const seller = await prisma.users.findUnique({
          where: { id: sale.seller_id },
          select: { first_name: true, last_name: true },
        })

        return {
          seller_name:
            `${seller?.first_name || ''} ${seller?.last_name || ''}`.trim() ||
            'Desconocido',
          total_sales: sale._sum.total_amount?.toNumber() || 0,
          order_count: sale._count.id,
          average_order_value:
            (sale._sum.total_amount?.toNumber() || 0) / sale._count.id,
        }
      })
    )

    return NextResponse.json(sellerDetails.filter(Boolean))
  } catch (error) {
    console.error('Error fetching seller sales summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seller sales summary' },
      { status: 500 }
    )
  }
}
