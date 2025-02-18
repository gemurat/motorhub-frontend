import { NextResponse } from 'next/server'
import { query } from '@/db'
import { getSession } from '@auth0/nextjs-auth0'
export const GET = async () => {
  try {
    const pendingOrders = await query(
      `SELECT o.id, o.customer_id, o.seller_id, u.username as seller_name, o.order_date, o.total_amount, 
                oi.product_id, p.description as product_name, oi.quantity, oi.price, o.status
         FROM "Orders" o
         JOIN "OrderItems" oi ON o.id = oi.order_id
         JOIN "Users" u ON o.seller_id = u.id
         JOIN "Products" p ON oi.product_id = p.id
         WHERE o.status IN ('IN REVIEW');`
    )

    const orders = pendingOrders.rows.reduce((acc, row) => {
      const {
        id,
        status,
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
          status,
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

export const PUT = async (req: Request) => {
  const body = await req.json()
  console.log('PUT /api/order-process-review', body)
  const { orderId, newStatus, completed } = body
  if (completed) {
    try {
      const updateOrderStatusQuery = `
        UPDATE public."Orders"
        SET status = $1
        WHERE id = $2;
      `
      await query(updateOrderStatusQuery, [newStatus, orderId])
      const getOrderItemsQuery = `
        SELECT product_id, quantity
        FROM public."OrderItems"
        WHERE order_id = $1;
      `
      const orderItems = await query(getOrderItemsQuery, [orderId])

      const updateProductStockQuery = `
        UPDATE public."Products"
        SET stock = stock - $1
        WHERE id = $2;
      `
      for (const item of orderItems.rows) {
        await query(updateProductStockQuery, [item.quantity, item.product_id])
      }
      // get user data for cashbox
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

      const getPaymentAmountQuery = `
        SELECT amount
        FROM public."Payments"
        WHERE order_id = $1 AND payment_method_id = 1;
      `
      const payment = await query(getPaymentAmountQuery, [orderId])

      if (payment.rows.length > 0) {
        const amount = payment.rows[0].amount

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
        const updateCashBoxesQuery = `
          UPDATE public."CashBoxes"
          SET current_balance = current_balance + $1
          WHERE id = $2;
        `
        await query(updateCashBoxesQuery, [amount, cashBoxId])
      }
      return NextResponse.json(
        { success: true, message: `Order status updated to ${newStatus}` },
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

  try {
    console.log('POR AQUI NO PASO')
    const { orderId, newStatus } = body
    console.log('Order ID:', orderId)
    console.log('newStatus:', newStatus)

    if (!orderId || !newStatus) {
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
    const updateOrderItemsStatusQuery = `
      UPDATE public."Payments"
      SET status = $1
      WHERE order_id = $2;
    `
    await query(updateOrderItemsStatusQuery, [newStatus, orderId])
    return NextResponse.json(
      { success: true, message: `Order status updated${newStatus}` },
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
