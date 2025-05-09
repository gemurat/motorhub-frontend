import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      store_id,
      items,
      payment_method,
      total_amount,
      customer_info,
      notes,
    } = body

    // Validate required fields
    if (!store_id || !items || !payment_method || !total_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the sale transaction
    const sale = await prisma.sales.create({
      data: {
        store_id: parseInt(store_id),
        user_id: session.user.sub,
        total_amount: parseFloat(total_amount),
        payment_method,
        customer_info,
        notes,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
        user: true,
      },
    })

    // Update inventory
    for (const item of items) {
      await prisma.inventory.update({
        where: {
          store_id_product_id: {
            store_id: parseInt(store_id),
            product_id: item.product_id,
          },
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      })
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const store_id = searchParams.get('store_id')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')

    const where: any = {}
    if (store_id) where.store_id = parseInt(store_id)
    if (start_date && end_date) {
      where.created_at = {
        gte: new Date(start_date),
        lte: new Date(end_date),
      }
    }

    const sales = await prisma.sales.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
        user: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}
