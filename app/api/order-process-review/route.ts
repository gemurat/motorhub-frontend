import { NextResponse } from 'next/server'
import { query } from '@/db'
const newStatus = 'IN REVIEW'

export const PUT = async (req: Request) => {
  console.log('najusiodbhnasjidlobas')

  const body = await req.json()
  try {
    const { orderId } = body
    console.log('Order ID:', orderId)
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }
    const updateOrderStatusQuery = `
      UPDATE public."Orders"
      SET status = $1
      WHERE id = $2;
    `
    await query(updateOrderStatusQuery, [newStatus, orderId])

    return NextResponse.json(
      { success: true, message: 'Order status updated to IN REVIEW' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
