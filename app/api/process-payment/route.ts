import { NextResponse } from 'next/server'
import { query } from '@/db'
import { getSession } from '@auth0/nextjs-auth0'

export const POST = async (req: Request) => {
  const body = await req.json()
  try {
    const { orderId, paymentMethodId, amount, newStatus, items } = body
    if (!orderId || !paymentMethodId || !amount || !newStatus || !items) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    if (paymentMethodId === 1) {
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
        return NextResponse.json(
          { success: false, error: 'Cash box not found' },
          { status: 404 }
        )
      }
      // Insert into CashBoxMovements
      const insertMovementQuery = `
    INSERT INTO public."CashBoxMovements" (cash_box_id, order_id, type, amount, description, date)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id;
    `
      const movementResult = await query(insertMovementQuery, [
        cashBoxId,
        orderId,
        'income',
        amount,
        'Payment for order ' + orderId,
      ])
      if (!movementResult) {
        return NextResponse.json(
          { success: false, error: 'Error inserting cash box movement' },
          { status: 500 }
        )
      }
      // Update CashBoxes current_balance based on the movement type
      const updateBalanceQuery = `
    UPDATE public."CashBoxes"
    SET current_balance = current_balance + $1,
        last_updated = NOW()
    WHERE id = $2;
  `
      const balanceChange = amount // Adjust balance based on type
      await query(updateBalanceQuery, [balanceChange, cashBoxId])
    }
    // Insert payment record
    const insertResult = await query(
      `INSERT INTO public."Payments" (order_id, payment_method_id, amount, date)
       VALUES ($1, $2, $3, NOW())`,
      [orderId, paymentMethodId, amount]
    )

    if (insertResult) {
      try {
        const updateResult = await query(
          `UPDATE public."Orders" SET status = $1 WHERE id = $2`,
          [newStatus, orderId]
        )

        if (updateResult) {
          // Update stock for each item
          for (const item of items) {
            await query(
              `UPDATE public."Products" SET stock = stock - $1 WHERE id = $2`,
              [item.quantity, item.product_id]
            )
          }

          return NextResponse.json({ success: true, orderId }, { status: 200 })
        } else {
          throw new Error('Error updating order status')
        }
      } catch (error) {
        console.error('Error updating order status:', error)
        return NextResponse.json(
          { success: false, error: 'Error updating order status' },
          { status: 500 }
        )
      }
    } else {
      throw new Error('Error inserting payment record')
    }
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
