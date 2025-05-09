import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        ChildStores: true,
      },
    })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }
    return NextResponse.json(store)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching store' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check if store exists
    const existingStore = await prisma.store.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (!existingStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Update store
    const updatedStore = await prisma.store.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        address: body.address,
        phone: body.phone,
        email: body.email,
        status: body.status,
        timezone: body.timezone,
        currency: body.currency,
        tax_rate:
          typeof body.tax_rate === 'string'
            ? parseFloat(body.tax_rate)
            : body.tax_rate,
        parent_store_id: body.parent_store_id,
        logo_url: body.logo_url,
        business_hours: body.business_hours,
      },
    })

    return NextResponse.json(updatedStore)
  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json(
      {
        error: 'Error updating store',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First check if store exists
    const existingStore = await prisma.store.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (!existingStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Soft delete by updating status to INACTIVE
    const store = await prisma.store.update({
      where: { id: parseInt(params.id) },
      data: {
        status: 'INACTIVE',
      },
    })

    return NextResponse.json({
      message: 'Store deactivated successfully',
      store,
    })
  } catch (error) {
    console.error('Error deactivating store:', error)
    return NextResponse.json(
      {
        error: 'Error deactivating store',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
