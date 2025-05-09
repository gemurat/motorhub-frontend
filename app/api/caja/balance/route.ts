import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: {
        auth0_id: session.user.sub,
      },
      select: {
        cashbox_id: true,
      },
    })

    if (!user || !user.cashbox_id) {
      return NextResponse.json(
        { error: 'No cashbox assigned' },
        { status: 404 }
      )
    }

    const cashbox = await prisma.cashBoxes.findUnique({
      where: {
        id: user.cashbox_id,
      },
      select: {
        local_name: true,
        current_balance: true,
        last_updated: true,
      },
    })

    if (!cashbox) {
      return NextResponse.json({ error: 'Cashbox not found' }, { status: 404 })
    }

    return NextResponse.json({
      local_name: cashbox.local_name,
      current_balance: cashbox.current_balance,
      last_updated: cashbox.last_updated,
    })
  } catch (error) {
    console.error('Error fetching cashbox balance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
