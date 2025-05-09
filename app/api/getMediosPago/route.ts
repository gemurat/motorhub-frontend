import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const mediosPago = await prisma.paymentMethods.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        requires_approval: true,
        affects_cashbox: true,
      },
    })
    return NextResponse.json(mediosPago)
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}
