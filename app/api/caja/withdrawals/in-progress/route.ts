import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cashboxId = searchParams.get('cashbox_id')
    const type = searchParams.get('type') || 'in-progress'

    if (!cashboxId) {
      return NextResponse.json(
        { error: 'Cashbox ID is required' },
        { status: 400 }
      )
    }

    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)

    const whereClause = {
      cash_box_id: parseInt(cashboxId),
      type: 'WITHDRAW',
      ...(type === 'in-progress'
        ? { status: 'IN_PROGRESS' }
        : {
            date: {
              gte: todayStart,
              lte: todayEnd,
            },
          }),
    }

    const withdrawals = await prisma.cashBoxMovements.findMany({
      where: whereClause,
      include: {
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

    const formattedWithdrawals = withdrawals.map((withdrawal) => ({
      id: withdrawal.id,
      amount: Number(withdrawal.amount),
      description: withdrawal.description,
      date: withdrawal.date,
      status: withdrawal.status,
      created_by:
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
