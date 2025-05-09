import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      )
    }

    // Get the user's cashbox
    const user = await prisma.users.findUnique({
      where: { auth0_id: session.user.sub },
      include: { CashBoxes: true },
    })

    if (!user?.CashBoxes) {
      return NextResponse.json(
        { error: 'No cashbox assigned to user' },
        { status: 404 }
      )
    }

    const cashbox = await prisma.cashBoxes.findUnique({
      where: { id: user.CashBoxes.id },
      select: {
        id: true,
        current_balance: true,
        last_updated: true,
        local_name: true,
        store_id: true,
      },
    })

    if (!cashbox) {
      return NextResponse.json({ error: 'Cashbox not found' }, { status: 404 })
    }

    return NextResponse.json(cashbox)
  } catch (error) {
    console.error('Error fetching current cashbox balance:', error)
    return NextResponse.json(
      {
        error: 'Error fetching current cashbox balance',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
