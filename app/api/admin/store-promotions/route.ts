import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const store_id = searchParams.get('store_id')
    const active_only = searchParams.get('active_only') === 'true'

    const where: any = {}
    if (store_id) where.store_id = parseInt(store_id)
    if (active_only) {
      where.is_active = true
      where.start_date = {
        lte: new Date(),
      }
      where.end_date = {
        gte: new Date(),
      }
    }

    const promotions = await prisma.storePromotions.findMany({
      where,
      include: {
        Store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          is_active: 'desc',
        },
        {
          start_date: 'desc',
        },
      ],
    })

    return NextResponse.json(promotions)
  } catch (error) {
    console.error('Error fetching store promotions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store promotions' },
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
    const {
      store_id,
      name,
      description,
      start_date,
      end_date,
      discount,
      is_active,
    } = body

    // Validate required fields
    if (
      !store_id ||
      !name ||
      !start_date ||
      !end_date ||
      discount === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for overlapping promotions
    const existingPromotion = await prisma.storePromotions.findFirst({
      where: {
        store_id: parseInt(store_id),
        is_active: true,
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
              lte: new Date(end_date),
            },
            end_date: {
              gte: new Date(end_date),
            },
          },
        ],
      },
    })

    if (existingPromotion) {
      return NextResponse.json(
        { error: 'Overlapping promotion exists' },
        { status: 400 }
      )
    }

    const promotion = await prisma.storePromotions.create({
      data: {
        store_id: parseInt(store_id),
        name,
        description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        discount: parseFloat(discount),
        is_active: is_active ?? true,
      },
      include: {
        Store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(promotion)
  } catch (error) {
    console.error('Error creating store promotion:', error)
    return NextResponse.json(
      { error: 'Failed to create store promotion' },
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
    const { id, name, description, start_date, end_date, discount, is_active } =
      body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing promotion ID' },
        { status: 400 }
      )
    }

    const promotion = await prisma.storePromotions.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined,
        discount: discount !== undefined ? parseFloat(discount) : undefined,
        is_active,
      },
      include: {
        Store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(promotion)
  } catch (error) {
    console.error('Error updating store promotion:', error)
    return NextResponse.json(
      { error: 'Failed to update store promotion' },
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
        { error: 'Missing promotion ID' },
        { status: 400 }
      )
    }

    await prisma.storePromotions.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting store promotion:', error)
    return NextResponse.json(
      { error: 'Failed to delete store promotion' },
      { status: 500 }
    )
  }
}
