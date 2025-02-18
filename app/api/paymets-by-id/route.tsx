import { query } from '@/db'
import { NextResponse } from 'next/server'

export const GET = async (req: Request) => {
  console.log('GET /api/paymets-by-id')

  try {
    const url = new URL(req.url)
    const OrderId = url.searchParams.get('orderId')
    let result
    if (OrderId) {
      result = await query(
        `SELECT * FROM public."Payments" WHERE order_id = $1 AND status = 'PENDING'`,
        [`${OrderId}`]
      )
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No payments found for this order' },
          { status: 404 }
        )
      } else {
        return NextResponse.json(
          { success: true, data: result.rows },
          { status: 200 }
        )
      }
    } else {
      result = await query(`SELECT * FROM public."GiftCards"`)
    }

    return NextResponse.json(
      { success: true, data: result.rows[0] },
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
