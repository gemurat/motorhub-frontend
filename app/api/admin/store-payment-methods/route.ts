import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const store_id = searchParams.get('store_id')

    const where: any = {}
    if (store_id) where.store_id = parseInt(store_id)

    const paymentMethods = await prisma.storePaymentMethods.findMany({
      where,
      include: {
        Store: {
          select: {
            id: true,
            name: true,
          },
        },
        PaymentMethods: true,
      },
      orderBy: {
        PaymentMethods: {
          name: 'asc',
        },
      },
    })

    return NextResponse.json(paymentMethods)
  } catch (error) {
    console.error('Error fetching store payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store payment methods' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { store_id, payment_method_id, is_active } = body

    // Validate required fields
    if (!store_id || !payment_method_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if the payment method is already configured for this store
    const existingMethod = await prisma.storePaymentMethods.findFirst({
      where: {
        store_id: parseInt(store_id),
        payment_method_id: parseInt(payment_method_id),
      },
    })

    if (existingMethod) {
      return NextResponse.json(
        { error: 'Payment method already configured for this store' },
        { status: 400 }
      )
    }

    const storePaymentMethod = await prisma.storePaymentMethods.create({
      data: {
        store_id: parseInt(store_id),
        payment_method_id: parseInt(payment_method_id),
        is_active: is_active ?? true,
      },
      include: {
        Store: {
          select: {
            id: true,
            name: true,
          },
        },
        PaymentMethods: true,
      },
    })

    return NextResponse.json(storePaymentMethod)
  } catch (error) {
    console.error('Error creating store payment method:', error)
    return NextResponse.json(
      { error: 'Failed to create store payment method' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, is_active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing payment method ID' },
        { status: 400 }
      )
    }

    const storePaymentMethod = await prisma.storePaymentMethods.update({
      where: { id: parseInt(id) },
      data: {
        is_active,
      },
      include: {
        Store: {
          select: {
            id: true,
            name: true,
          },
        },
        PaymentMethods: true,
      },
    })

    return NextResponse.json(storePaymentMethod)
  } catch (error) {
    console.error('Error updating store payment method:', error)
    return NextResponse.json(
      { error: 'Failed to update store payment method' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing payment method ID' },
        { status: 400 }
      )
    }

    await prisma.storePaymentMethods.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting store payment method:', error)
    return NextResponse.json(
      { error: 'Failed to delete store payment method' },
      { status: 500 }
    )
  }
}
