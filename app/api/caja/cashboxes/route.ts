import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      console.error('Store ID is missing in request')
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      )
    }

    const cashboxes = await prisma.cashBoxes.findMany({
      where: {
        store_id: parseInt(storeId),
      },
      select: {
        id: true,
        local_name: true,
        current_balance: true,
        last_updated: true,
      },
      orderBy: {
        local_name: 'asc',
      },
    })

    return NextResponse.json(cashboxes)
  } catch (error) {
    console.error('Error fetching cashboxes:', error)
    return NextResponse.json(
      {
        error: 'Error fetching cashboxes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.local_name || !body.store_id) {
      return NextResponse.json(
        { error: 'Local name and store ID are required' },
        { status: 400 }
      )
    }

    const cashbox = await prisma.cashBoxes.create({
      data: {
        local_name: body.local_name,
        current_balance: 0,
        last_updated: new Date(),
        store_id: body.store_id,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        Store: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(cashbox)
  } catch (error) {
    console.error('Error creating cashbox:', error)
    return NextResponse.json(
      {
        error: 'Error creating cashbox',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!body.id || !body.local_name) {
      return NextResponse.json(
        { error: 'ID and local name are required' },
        { status: 400 }
      )
    }

    const cashbox = await prisma.cashBoxes.update({
      where: {
        id: body.id,
      },
      data: {
        local_name: body.local_name,
        current_balance: body.current_balance,
        last_updated: new Date(),
        updated_at: new Date(),
      },
      include: {
        Store: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(cashbox)
  } catch (error) {
    console.error('Error updating cashbox:', error)
    return NextResponse.json(
      {
        error: 'Error updating cashbox',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Cashbox ID is required' },
        { status: 400 }
      )
    }

    // Check if the cashbox has any associated users
    const cashbox = await prisma.cashBoxes.findUnique({
      where: { id: parseInt(id) },
      include: { Users: true },
    })

    if (cashbox?.Users.length) {
      return NextResponse.json(
        { error: 'Cannot delete cashbox with associated users' },
        { status: 400 }
      )
    }

    await prisma.cashBoxes.delete({
      where: {
        id: parseInt(id),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cashbox:', error)
    return NextResponse.json(
      {
        error: 'Error deleting cashbox',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
