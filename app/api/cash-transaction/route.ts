import { NextResponse } from 'next/server'
import { query } from '@/db'
import { getSession } from '@auth0/nextjs-auth0'

export const GET = async (req: Request) => {
  try {
    const session = await getSession()
    const fetchUserCashBox = `
      SELECT caja
      FROM public."Users"
      WHERE username = $1;
    `
    const userCashBoxResult = await query(fetchUserCashBox, [
      session?.user.email,
    ])

    // Query to fetch current_balance and last_updated
    const fetchBalanceQuery = `
      SELECT current_balance, last_updated
      FROM public."CashBoxes"
      WHERE id = $1;
    `
    const result = await query(fetchBalanceQuery, [
      userCashBoxResult.rows[0].caja,
    ])

    // Check if the cash box exists
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cash box not found' },
        { status: 404 }
      )
    }
    // Return the data

    const { current_balance, last_updated } = result.rows[0]
    return NextResponse.json(
      { success: true, current_balance, last_updated },
      { status: 200 }
    )
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}

export const POST = async (req: Request) => {
  const body = await req.json()

  try {
    const { orderId, type, amount, description } = body

    // Validate required fields
    if (!type || !amount || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    // get the user's cash box
    const session = await getSession()
    const fetchUserCashBox = `
      SELECT caja
      FROM public."Users"
      WHERE username = $1;
    `
    const userCashBoxResult = await query(fetchUserCashBox, [
      session?.user.email,
    ])
    const cashBoxId = userCashBoxResult.rows[0]?.caja

    if (!cashBoxId) {
      return NextResponse.json({ error: 'Cash box not found' }, { status: 404 })
    }

    // Insert into CashBoxMovements
    const insertMovementQuery = `
    INSERT INTO public."CashBoxMovements" (cash_box_id, order_id, type, amount, description, date)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id;
    `
    const movementResult = await query(insertMovementQuery, [
      cashBoxId,
      orderId || null, // order_id is optional
      type,
      amount,
      description,
    ])

    // Update CashBoxes current_balance based on the movement type
    const updateBalanceQuery = `
      UPDATE public."CashBoxes"
      SET current_balance = current_balance + $1,
          last_updated = NOW()
      WHERE id = $2;
    `
    const balanceChange = type.toUpperCase() === 'INCOME' ? amount : -amount // Adjust balance based on type
    await query(updateBalanceQuery, [balanceChange, cashBoxId])

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
