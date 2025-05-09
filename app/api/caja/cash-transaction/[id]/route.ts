import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const expenseId = parseInt(params.id)
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      )
    }

    if (!expenseId) {
      return NextResponse.json(
        { success: false, error: 'Expense ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { status, rejection_reason } = body

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get the expense details
    const expense = await prisma.cashBoxMovements.findFirst({
      where: {
        id: expenseId,
        status: 'IN REVIEW',
      },
    })

    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found or not in review' },
        { status: 404 }
      )
    }

    // Get the user's ID from the database using their auth0_id
    const userRecord = await prisma.users.findFirst({
      where: {
        auth0_id: session.user.sub,
      },
    })

    if (!userRecord) {
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Start a transaction to ensure both updates succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update the expense status
      const updatedExpense = await tx.cashBoxMovements.update({
        where: {
          id: expenseId,
        },
        data: {
          status,
          approved_by: userRecord.id,
          approval_date: new Date(),
          rejection_reason: rejection_reason || null,
        },
        include: {
          Users_CashBoxMovements_created_byToUsers: {
            select: {
              username: true,
            },
          },
          Users_CashBoxMovements_approved_byToUsers: {
            select: {
              username: true,
            },
          },
          CashBoxes: {
            select: {
              local_name: true,
            },
          },
          Store: {
            select: {
              name: true,
            },
          },
        },
      })

      // If approved, update the cashbox balance
      if (status === 'APPROVED') {
        await tx.cashBoxes.update({
          where: {
            id: expense.cash_box_id,
          },
          data: {
            current_balance: {
              decrement: Number(expense.amount),
            },
            last_updated: new Date(),
          },
        })
      }

      return updatedExpense
    })

    // Format the response
    const formattedExpense = {
      id: result.id,
      type: result.type,
      description: result.description,
      amount: Number(result.amount),
      date: result.date.toISOString(),
      status: result.status,
      cash_box_id: result.cash_box_id,
      store_id: result.store_id,
      created_by_username:
        result.Users_CashBoxMovements_created_byToUsers.username,
      approved_by_username:
        result.Users_CashBoxMovements_approved_byToUsers?.username,
      cashbox_name: result.CashBoxes.local_name,
      store_name: result.Store.name || 'Tienda Desconocida',
    }

    return NextResponse.json(
      { success: true, expense: formattedExpense },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error in PATCH /api/caja/cash-transaction/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database error',
      },
      { status: 500 }
    )
  }
}
