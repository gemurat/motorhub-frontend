import { NextResponse } from 'next/server'
import { query } from '@/db'
export const GET = async () => {
  try {
    const pendingOrders = await query(
      `SELECT o.id, o.customer_id, o.seller_id, u.username as seller_name, o.order_date, o.total_amount, 
              oi.product_id, p.description as product_name, oi.quantity, oi.price
       FROM "Orders" o
       JOIN "OrderItems" oi ON o.id = oi.order_id
       JOIN "Users" u ON o.seller_id = u.id
       JOIN "Products" p ON oi.product_id = p.id
       WHERE o.status = 'PENDING'`
    )

    const orders = pendingOrders.rows.reduce((acc, row) => {
      const {
        id,
        customer_id,
        seller_id,
        seller_name,
        order_date,
        total_amount,
        product_id,
        product_name,
        quantity,
        price,
      } = row
      if (!acc[id]) {
        acc[id] = {
          id,
          customer_id,
          seller_id,
          seller_name,
          order_date,
          total_amount,
          items: [],
        }
      }
      acc[id].items.push({ product_id, product_name, quantity, price })
      return acc
    }, {})

    return NextResponse.json(
      { success: true, orders: Object.values(orders) },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
export const POST = async (req: Request) => {
  try {
    const body = await req.json()

    const { customerId, sellerId, items, total_amount } = body

    if (!customerId || !items || !sellerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    try {
      const result = await query(
        `SELECT * FROM public."Clients" WHERE id = $1`,
        [customerId]
      )

      // If the user does not exist, insert the user data
      if (result.rows.length === 0) {
        await query(`INSERT INTO public."Clients" (id) VALUES ($1)`, [
          customerId,
        ])
      }
    } catch (error) {
      console.error('Database error:', error)
      throw new Error('Database error')
    }
    // Insert Order
    const sellerIdToOrder = await query(
      `SELECT * FROM public."Users" WHERE username = $1`,
      [sellerId]
    )
    // console.log(body)
    // return NextResponse.json({ success: true }, { status: 900 })
    const ORDERSTATUS = 'PENDING'
    const order = await query(
      `INSERT INTO "Orders" (customer_id, seller_id, order_date, total_amount, status)
      VALUES ($1, $2, NOW(), $3, $4) RETURNING id`,
      [customerId, sellerIdToOrder.rows[0].id, total_amount, ORDERSTATUS]
    )

    const orderId = order.rows[0].id

    // Insert Order Items
    for (const item of items) {
      await query(
        `INSERT INTO "OrderItems" (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.cantidad, item.price]
      )
    }

    return NextResponse.json({ success: true, orderId }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
