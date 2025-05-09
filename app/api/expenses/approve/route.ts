import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { expenseId, approved, notes } = body

    if (!expenseId) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      )
    }

    const expense = await prisma.expenses.update({
      where: { id: parseInt(expenseId) },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        approval_notes: notes,
        approved_by: session.user.sub,
        approved_at: new Date(),
      },
      include: {
        Store: true,
        User: true,
        Category: true,
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error approving expense:', error)
    return NextResponse.json(
      { error: 'Failed to approve expense' },
      { status: 500 }
    )
  }
}
