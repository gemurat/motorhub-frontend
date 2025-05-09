import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const withdrawalId = parseInt(params.id)
    if (isNaN(withdrawalId)) {
      return NextResponse.json(
        { error: 'Invalid withdrawal ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get the current withdrawal
    const currentWithdrawal = await prisma.cashBoxMovements.findUnique({
      where: { id: withdrawalId },
      include: {
        CashBoxes: true,
      },
    })

    if (!currentWithdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      )
    }

    if (currentWithdrawal.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Withdrawal is not in progress' },
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

    // Update the withdrawal status
    const updatedWithdrawal = await prisma.cashBoxMovements.update({
      where: { id: withdrawalId },
      data: {
        status,
        approved_by: user.id,
        approval_date: new Date(),
      },
    })

    // If completed, update cashbox balance
    if (status === 'COMPLETED') {
      await prisma.cashBoxes.update({
        where: { id: currentWithdrawal.cash_box_id },
        data: {
          current_balance: {
            decrement: currentWithdrawal.amount,
          },
          last_updated: new Date(),
        },
      })
    }

    return NextResponse.json({ withdrawal: updatedWithdrawal })
  } catch (error) {
    console.error('Error updating withdrawal:', error)
    return NextResponse.json(
      { error: 'Failed to update withdrawal' },
      { status: 500 }
    )
  }
}
