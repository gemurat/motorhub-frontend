import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { withAuth } from '../../middleware/auth'
import { MovementType, MovementStatus } from '../../types/cashBox'
import { z } from 'zod'
import prisma from '@/lib/prisma'

// Validation schemas
const createMovementSchema = z.object({
  type: z.enum([MovementType.INCOME, MovementType.EXPENSE]),
  amount: z.number().positive(),
  description: z.string().min(1),
  cash_box_id: z.number(),
  store_id: z.number(),
})

export const GET = withAuth(async (req: Request, user: any) => {
  try {
    const url = new URL(req.url)
    const showExpenses = url.searchParams.get('showExpenses') === 'true'
    const showInReview = url.searchParams.get('showInReview') === 'true'
    const cashBoxId = url.searchParams.get('cashBoxId')

    if (showInReview) {
      const expenses = await prisma.cashBoxMovements.findMany({
        where: {
          type: 'expense',
          status: 'IN REVIEW',
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
        orderBy: {
          date: 'desc',
        },
      })

      const formattedExpenses = expenses.map((expense) => ({
        id: expense.id,
        type: expense.type,
        description: expense.description,
        amount: Number(expense.amount),
        date: expense.date.toISOString(),
        status: expense.status,
        cash_box_id: expense.cash_box_id,
        store_id: expense.store_id,
        created_by_username:
          expense.Users_CashBoxMovements_created_byToUsers.username,
        approved_by_username:
          expense.Users_CashBoxMovements_approved_byToUsers?.username,
        cashbox_name: expense.CashBoxes.local_name,
        store_name: expense.Store.name || 'Tienda Desconocida',
      }))

      return NextResponse.json(
        { success: true, response: formattedExpenses },
        { status: 200 }
      )
    }

    if (showExpenses && cashBoxId) {
      const expenses = await prisma.cashBoxMovements.findMany({
        where: {
          type: 'expense',
          cash_box_id: parseInt(cashBoxId),
        },
        orderBy: {
          date: 'desc',
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

      const formattedExpenses = expenses.map((expense) => ({
        id: expense.id,
        type: expense.type,
        description: expense.description,
        amount: Number(expense.amount),
        date: expense.date.toISOString(),
        status: expense.status,
        cash_box_id: expense.cash_box_id,
        store_id: expense.store_id,
        created_by_username:
          expense.Users_CashBoxMovements_created_byToUsers.username,
        approved_by_username:
          expense.Users_CashBoxMovements_approved_byToUsers?.username,
        cashbox_name: expense.CashBoxes.local_name,
        store_name: expense.Store.name || 'Tienda Desconocida',
      }))

      return NextResponse.json({ success: true, expenses: formattedExpenses })
    }

    const cashBox = await prisma.cashBoxes.findUnique({
      where: {
        id: Number(cashBoxId),
      },
      select: {
        current_balance: true,
        last_updated: true,
      },
    })

    if (!cashBox) {
      return NextResponse.json(
        { success: false, error: 'Cash box not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        current_balance: Number(cashBox.current_balance),
        last_updated: cashBox.last_updated.toISOString(),
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error in GET /api/cash-transaction:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database error',
      },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (req: Request, user: any) => {
  try {
    const body = await req.json()
    const validatedData = createMovementSchema.parse(body)

    const userRecord = await prisma.users.findFirst({
      where: {
        auth0_id: user.sub,
      },
    })

    if (!userRecord) {
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      )
    }

    // For expenses, set status to IN REVIEW
    const status =
      validatedData.type === MovementType.EXPENSE ? 'IN REVIEW' : 'PENDING'

    const movement = await prisma.cashBoxMovements.create({
      data: {
        cash_box_id: validatedData.cash_box_id,
        store_id: validatedData.store_id,
        type: validatedData.type,
        amount: validatedData.amount,
        description: validatedData.description,
        date: new Date(),
        status,
        created_by: userRecord.id,
      },
    })

    return NextResponse.json(
      {
        success: true,
        movementId: movement.id,
        status,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error in POST /api/cash-transaction:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database error',
      },
      { status: 500 }
    )
  }
})
