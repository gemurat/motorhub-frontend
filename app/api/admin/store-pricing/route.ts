import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const store_id = searchParams.get('store_id')
    const product_id = searchParams.get('product_id')

    const where: any = {}
    if (store_id) where.store_id = parseInt(store_id)
    if (product_id) where.product_id = parseInt(product_id)

    const pricing = await prisma.storeProductPricing.findMany({
      where,
      include: {
        Store: {
          select: {
            id: true,
            name: true,
          },
        },
        Products: {
          select: {
            id: true,
            description: true,
            internal_code: true,
          },
        },
      },
      orderBy: {
        start_date: 'desc',
      },
    })

    return NextResponse.json(pricing)
  } catch (error) {
    console.error('Error fetching store pricing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store pricing' },
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
    const { store_id, product_id, price, start_date, end_date } = body

    // Validate required fields
    if (!store_id || !product_id || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for overlapping date ranges
    const existingPricing = await prisma.storeProductPricing.findFirst({
      where: {
        store_id: parseInt(store_id),
        product_id: parseInt(product_id),
        OR: [
          {
            start_date: {
              lte: new Date(start_date),
            },
            end_date: {
              gte: new Date(start_date),
            },
          },
          {
            start_date: {
              lte: end_date ? new Date(end_date) : new Date('9999-12-31'),
            },
            end_date: {
              gte: end_date ? new Date(end_date) : new Date('9999-12-31'),
            },
          },
        ],
      },
    })

    if (existingPricing) {
      return NextResponse.json(
        { error: 'Overlapping date range exists' },
        { status: 400 }
      )
    }

    const pricing = await prisma.storeProductPricing.create({
      data: {
        store_id: parseInt(store_id),
        product_id: parseInt(product_id),
        price: parseFloat(price),
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
      },
      include: {
        Store: {
          select: {
            id: true,
            name: true,
          },
        },
        Products: {
          select: {
            id: true,
            description: true,
            internal_code: true,
          },
        },
      },
    })

    return NextResponse.json(pricing)
  } catch (error) {
    console.error('Error creating store pricing:', error)
    return NextResponse.json(
      { error: 'Failed to create store pricing' },
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
    const { id, store_id, product_id, price, start_date, end_date } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing pricing ID' }, { status: 400 })
    }

    const pricing = await prisma.storeProductPricing.update({
      where: { id: parseInt(id) },
      data: {
        store_id: parseInt(store_id),
        product_id: parseInt(product_id),
        price: parseFloat(price),
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
      },
      include: {
        Store: {
          select: {
            id: true,
            name: true,
          },
        },
        Products: {
          select: {
            id: true,
            description: true,
            internal_code: true,
          },
        },
      },
    })

    return NextResponse.json(pricing)
  } catch (error) {
    console.error('Error updating store pricing:', error)
    return NextResponse.json(
      { error: 'Failed to update store pricing' },
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
      return NextResponse.json({ error: 'Missing pricing ID' }, { status: 400 })
    }

    await prisma.storeProductPricing.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting store pricing:', error)
    return NextResponse.json(
      { error: 'Failed to delete store pricing' },
      { status: 500 }
    )
  }
}
