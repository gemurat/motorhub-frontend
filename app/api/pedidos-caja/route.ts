import { NextResponse } from 'next/server'
import { query } from '@/db'

export const GET = async (req: Request) => {
  try {
    // Query to fetch current_balance and last_updated
    const fetchLocalOrderQuery = `
      SELECT *
      FROM public."LocalOrders"
      WHERE status = 'PENDING';
    `
    const result = await query(fetchLocalOrderQuery)

    // Check if the cash box exists
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No orders found not found' },
        { status: 404 }
      )
    }
    // Return the data
    return NextResponse.json({ success: true, response: result.rows })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}

export const POST = async (req: Request) => {
  try {
    const { order_date, supplier_id, total_amount, status, vale } =
      await req.json()

    // Validate the input
    if (!order_date || !supplier_id || !total_amount || !status || !vale) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate types
    if (
      isNaN(Date.parse(order_date)) ||
      typeof total_amount !== 'number' ||
      typeof status !== 'string' ||
      typeof vale !== 'number'
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid field types' },
        { status: 400 }
      )
    }
    // Query to insert a new order
    const insertOrderQuery = `
      INSERT INTO public."LocalOrders" (order_date, supplier_id, total_amount, status, vale)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `
    const values = [order_date, supplier_id, total_amount, status, vale]
    const result = await query(insertOrderQuery, values)

    // Return the inserted data
    return NextResponse.json(
      { success: true, response: result.rows[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
export const PUT = async (req: Request) => {
  try {
    const { id, status } = await req.json()

    // Validate the input
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate types
    if (typeof id !== 'number' || typeof status !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid field types' },
        { status: 400 }
      )
    }

    // Query to update the order status
    const updateOrderStatusQuery = `
      UPDATE public."LocalOrders"
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `
    const values = [status, id]
    const result = await query(updateOrderStatusQuery, values)

    // Check if the order exists
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Return the updated data
    return NextResponse.json(
      { success: true, response: result.rows[0] },
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
