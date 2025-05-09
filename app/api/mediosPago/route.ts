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

export async function POST(request: Request) {
  try {
    const { name, requires_approval, affects_cashbox } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const medioPago = await prisma.paymentMethods.create({
      data: {
        name,
        requires_approval: requires_approval ?? false,
        affects_cashbox: affects_cashbox ?? true,
      },
    })

    return NextResponse.json(medioPago)
  } catch (error) {
    console.error('Error creating payment method:', error)
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    )
  }
}
