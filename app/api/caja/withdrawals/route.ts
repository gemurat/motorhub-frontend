import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'
import { Decimal } from '@prisma/client/runtime/library'

interface Withdrawal {
  id: number
  amount: Decimal
  description: string
  date: Date
  status: string
  cash_box_id: number
  store_id: number
  Store: {
    name: string
  }
  CashBoxes: {
    local_name: string
  }
  Users_CashBoxMovements_created_byToUsers: {
    username: string | null
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const withdrawals = await prisma.cashBoxMovements.findMany({
      where: {
        type: 'WITHDRAW',
      },
      include: {
        Store: {
          select: {
            name: true,
          },
        },
        CashBoxes: {
          select: {
            local_name: true,
          },
        },
        Users_CashBoxMovements_created_byToUsers: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    const formattedWithdrawals = withdrawals.map((withdrawal: Withdrawal) => ({
      id: withdrawal.id,
      amount: Number(withdrawal.amount),
      description: withdrawal.description,
      date: withdrawal.date,
      status: withdrawal.status,
      cash_box_id: withdrawal.cash_box_id,
      store_id: withdrawal.store_id,
      store_name: withdrawal.Store.name,
      cashbox_name: withdrawal.CashBoxes.local_name,
      created_by_username:
        withdrawal.Users_CashBoxMovements_created_byToUsers.username ||
        'Unknown',
    }))

    return NextResponse.json({ withdrawals: formattedWithdrawals })
  } catch (error) {
    console.error('Error fetching withdrawals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { store_id, cash_box_id, amount, description } = body

    // Validate required fields
    if (!store_id || !cash_box_id || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if cashbox belongs to the store
    const cashbox = await prisma.cashBoxes.findFirst({
      where: {
        id: cash_box_id,
        store_id: store_id,
      },
    })

    if (!cashbox) {
      return NextResponse.json(
        { error: 'Cashbox not found in the specified store' },
        { status: 400 }
      )
    }

    // Check if cashbox has sufficient balance
    if (cashbox.current_balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance in cashbox' },
        { status: 400 }
      )
    }

    // Get the user's database ID
    const user = await prisma.users.findUnique({
      where: { auth0_id: session.user.sub },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Create the withdrawal
    const withdrawal = await prisma.cashBoxMovements.create({
      data: {
        store_id,
        cash_box_id,
        amount,
        description,
        type: 'WITHDRAW',
        status: 'IN_PROGRESS',
        date: new Date(),
        created_by: user.id,
      },
    })

    return NextResponse.json({ withdrawal })
  } catch (error) {
    console.error('Error creating withdrawal:', error)
    return NextResponse.json(
      { error: 'Failed to create withdrawal' },
      { status: 500 }
    )
  }
}
