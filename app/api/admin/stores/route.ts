import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'

type UserStoreAccess = {
  Store: {
    id: number
    name: string
    address: string | null
    phone: string | null
    email: string | null
    status: string
    timezone: string
    currency: string
    tax_rate: number
    logo_url: string | null
    business_hours: string | null
    created_at: Date
    updated_at: Date
  }
}

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        ParentStore: {
          select: {
            id: true,
            name: true,
          },
        },
        ChildStores: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    return NextResponse.json(stores)
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
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
      name,
      address,
      phone,
      email,
      timezone = 'UTC',
      currency = 'USD',
      tax_rate = 0,
      business_hours,
      parent_store_id,
      logo_url,
    } = body

    const store = await prisma.store.create({
      data: {
        name,
        address,
        phone,
        email,
        timezone,
        currency,
        tax_rate,
        business_hours,
        parent_store_id: parent_store_id ? parseInt(parent_store_id) : null,
        logo_url,
      },
      include: {
        ParentStore: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('Error creating store:', error)
    return NextResponse.json(
      { error: 'Failed to create store' },
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
    const {
      id,
      name,
      address,
      phone,
      email,
      timezone,
      currency,
      tax_rate,
      business_hours,
      parent_store_id,
      logo_url,
    } = body

    const store = await prisma.store.update({
      where: { id: parseInt(id) },
      data: {
        name,
        address,
        phone,
        email,
        timezone,
        currency,
        tax_rate:
          typeof tax_rate === 'string' ? parseFloat(tax_rate) : tax_rate,
        business_hours,
        parent_store_id: parent_store_id ? parseInt(parent_store_id) : null,
        logo_url,
      },
      include: {
        ParentStore: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json(
      { error: 'Failed to update store' },
      { status: 500 }
    )
  }
}
