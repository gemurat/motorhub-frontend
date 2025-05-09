import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function POST(request: Request) {
  try {
    const { storeId, cashboxId } = await request.json()

    if (!storeId || !cashboxId) {
      return NextResponse.json(
        { error: 'Store ID and Cashbox ID are required' },
        { status: 400 }
      )
    }

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    // Fetch all necessary data for the report
    const [cashbox, payments, expenses, orders, sellerSales] =
      await Promise.all([
        // Get cashbox details
        prisma.cashBoxes.findUnique({
          where: { id: parseInt(cashboxId) },
          include: {
            Store: true,
          },
        }),

        // Get all payments for today
        prisma.payments.findMany({
          where: {
            Orders: {
              store_id: parseInt(storeId),
              order_date: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          },
          include: {
            PaymentMethods: true,
            Orders: true,
          },
        }),

        // Get all expenses for today
        prisma.cashBoxMovements.findMany({
          where: {
            cash_box_id: parseInt(cashboxId),
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            Users_CashBoxMovements_created_byToUsers: true,
            Users_CashBoxMovements_approved_byToUsers: true,
          },
        }),

        // Get all orders for today
        prisma.orders.findMany({
          where: {
            store_id: parseInt(storeId),
            order_date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            OrderItems: {
              include: {
                Products: true,
              },
            },
            Users: true,
          },
        }),

        // Get seller sales summary
        prisma.orders.groupBy({
          by: ['seller_id'],
          where: {
            store_id: parseInt(storeId),
            order_date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: {
            total_amount: true,
          },
          _count: {
            id: true,
          },
        }),
      ])

    if (!cashbox) {
      return NextResponse.json({ error: 'Cashbox not found' }, { status: 404 })
    }

    // Calculate payment method totals
    const paymentMethodTotals = payments.reduce(
      (acc, payment) => {
        const method = payment.PaymentMethods.name
        if (!acc[method]) {
          acc[method] = {
            total: 0,
            count: 0,
          }
        }
        acc[method].total += Number(payment.amount)
        acc[method].count += 1
        return acc
      },
      {} as Record<string, { total: number; count: number }>
    )

    // Calculate expense totals
    const expenseTotals = expenses.reduce(
      (acc, expense) => {
        if (!acc[expense.status]) {
          acc[expense.status] = {
            total: 0,
            count: 0,
          }
        }
        acc[expense.status].total += Number(expense.amount)
        acc[expense.status].count += 1
        return acc
      },
      {} as Record<string, { total: number; count: number }>
    )

    // Prepare the report data
    const reportData = {
      store: {
        name: cashbox.Store.name,
        address: cashbox.Store.address,
      },
      cashbox: {
        name: cashbox.local_name,
        current_balance: cashbox.current_balance,
      },
      date: format(new Date(), 'PPP', { locale: es }),
      time: format(new Date(), 'p', { locale: es }),
      summary: {
        total_sales: orders.reduce(
          (sum, order) => sum + Number(order.total_amount || 0),
          0
        ),
        total_transactions: orders.length,
        payment_methods: Object.entries(paymentMethodTotals).map(
          ([method, data]) => ({
            method,
            total: data.total,
            count: data.count,
          })
        ),
        expenses: Object.entries(expenseTotals).map(([status, data]) => ({
          status,
          total: data.total,
          count: data.count,
        })),
      },
      seller_sales: sellerSales.map((sale) => ({
        seller_id: sale.seller_id,
        total_sales: Number(sale._sum.total_amount || 0),
        order_count: sale._count.id,
      })),
      orders: orders.map((order) => ({
        id: order.id,
        total: Number(order.total_amount || 0),
        items: order.OrderItems.map((item) => ({
          product: item.Products?.description || 'Producto no disponible',
          quantity: item.quantity || 0,
          price: item.price || 0,
        })),
        seller: order.Users?.username || 'N/A',
      })),
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error generating cash register report:', error)
    return NextResponse.json(
      { error: 'Failed to generate cash register report' },
      { status: 500 }
    )
  }
}
