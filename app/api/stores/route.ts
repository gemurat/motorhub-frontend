import { NextResponse } from 'next/server'
import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@/lib/prisma'

export const GET = withApiAuthRequired(async function GET() {
  try {
    // First get all active stores with their cashboxes
    const stores = await prisma.store.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        CashBoxes: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Filter out stores that don't have any cashboxes
    const storesWithCashboxes = stores.filter(
      (store) => store.CashBoxes.length > 0
    )

    // Return only the necessary fields
    const result = storesWithCashboxes.map((store) => ({
      id: store.id,
      name: store.name,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    )
  }
})
