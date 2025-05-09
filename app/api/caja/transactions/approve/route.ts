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
    const { transactionId, approved, notes } = body

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transactions.update({
      where: { id: parseInt(transactionId) },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        approval_notes: notes,
        approved_by: session.user.sub,
        approved_at: new Date(),
      },
      include: {
        Store: true,
        User: true,
      },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error approving transaction:', error)
    return NextResponse.json(
      { error: 'Failed to approve transaction' },
      { status: 500 }
    )
  }
}
