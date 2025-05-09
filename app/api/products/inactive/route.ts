import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.products.findMany({
      where: {
        status: 'INACTIVE',
      },
      include: {
        StoreInventory: {
          include: {
            Store: true,
          },
        },
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching inactive products:', error)
    return NextResponse.json(
      {
        error: 'Error fetching inactive products',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
