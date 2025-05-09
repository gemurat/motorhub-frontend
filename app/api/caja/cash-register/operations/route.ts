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
    const {
      store_id,
      cash_register_id,
      operation_type,
      amount,
      description,
      notes,
    } = body

    // Validate required fields
    if (!store_id || !cash_register_id || !operation_type || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current cash register balance
    const cashRegister = await prisma.cashRegisters.findUnique({
      where: {
        id: parseInt(cash_register_id),
      },
    })

    if (!cashRegister) {
      return NextResponse.json(
        { error: 'Cash register not found' },
        { status: 404 }
      )
    }

    // Validate operation based on type
    if (operation_type === 'WITHDRAWAL' && amount > cashRegister.balance) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 })
    }

    // Create the operation
    const operation = await prisma.cashRegisterOperations.create({
      data: {
        store_id: parseInt(store_id),
        cash_register_id: parseInt(cash_register_id),
        user_id: session.user.sub,
        operation_type,
        amount: parseFloat(amount),
        description,
        notes,
        status: 'COMPLETED',
      },
      include: {
        store: true,
        cash_register: true,
        user: true,
      },
    })

    // Update cash register balance
    await prisma.cashRegisters.update({
      where: {
        id: parseInt(cash_register_id),
      },
      data: {
        balance: {
          increment: operation_type === 'DEPOSIT' ? amount : -amount,
        },
      },
    })

    return NextResponse.json(operation)
  } catch (error) {
    console.error('Error creating cash register operation:', error)
    return NextResponse.json(
      { error: 'Failed to create cash register operation' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const store_id = searchParams.get('store_id')
    const cash_register_id = searchParams.get('cash_register_id')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')

    const where: any = {}
    if (store_id) where.store_id = parseInt(store_id)
    if (cash_register_id) where.cash_register_id = parseInt(cash_register_id)
    if (start_date && end_date) {
      where.created_at = {
        gte: new Date(start_date),
        lte: new Date(end_date),
      }
    }

    const operations = await prisma.cashRegisterOperations.findMany({
      where,
      include: {
        store: true,
        cash_register: true,
        user: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return NextResponse.json(operations)
  } catch (error) {
    console.error('Error fetching cash register operations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cash register operations' },
      { status: 500 }
    )
  }
}
