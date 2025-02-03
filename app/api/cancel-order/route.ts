import { NextResponse } from 'next/server'
import { query } from '@/db'

export const POST = async (req: Request) => {
  const body = await req.json()
  try {
    const { orderId, paymentMethodId, amount, newStatus, items } = body
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    // update order status to CANCELLED
    const updateResult = await query(
      `UPDATE public."Orders" SET status = 'CANCELLED' WHERE id = $1`,
      [orderId]
    )
    return NextResponse.json({ success: true, orderId }, { status: 200 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
