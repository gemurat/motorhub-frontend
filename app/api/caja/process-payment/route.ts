import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'
import { Prisma } from '@prisma/client'

export const GET = async () => {
  try {
    const session = await getSession()
    if (!session?.user?.sub) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const orders = await prisma.orders.findMany({
      where: {
        status: {
          in: ['PENDING'],
        },
      },
      include: {
        OrderItems: {
          include: {
            Products: true,
          },
        },
        Users: true,
        Clients: true,
        Payments: {
          include: {
            PaymentMethods: true,
          },
        },
      },
    })

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      status: order.status,
      customer_id: order.customer_id || 'N/A',
      customer_name: order.Clients?.name || 'N/A',
      seller_name: order.Users?.username || 'N/A',
      order_date: order.order_date,
      total_amount: Number(order.total_amount) || 0,
      items: order.OrderItems.map((item) => ({
        product_id: item.product_id || 0,
        product_name: item.Products?.description || 'N/A',
        quantity: item.quantity || 0,
        price: Number(item.price) || 0,
      })),
      payments: order.Payments.map((payment) => ({
        id: payment.id,
        amount: Number(payment.amount),
        status: payment.status,
        payment_method: {
          id: payment.PaymentMethods.id,
          name: payment.PaymentMethods.name,
        },
      })),
    }))

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Error fetching orders' },
      { status: 500 }
    )
  }
}

export const POST = async (req: Request) => {
  const APPROVED_ORDER_STATUS = 'APPROVED'
  const PAYMENT_STATUS = 'APPROVED'
  const REVIEW_PAYMENT_STATUS = 'IN REVIEW'
  const PENDING_PAYMENT_STATUS = 'PENDING'
  const ORDER_PAYMENT_STATUS = {
    PAID: 'PAID',
    PENDING: 'PENDING',
  } as const
  const body = await req.json()

  try {
    const {
      orderId,
      paymentMethodId,
      amount,
      items,
      paymentAmounts,
      giftcardId,
    } = body

    if (!orderId || !paymentMethodId || !amount || !items || !paymentAmounts) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const session = await getSession()
    if (!session?.user?.sub) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const giftCardPayment = Object.keys(paymentAmounts).includes('4')
    const transferenciaPayment = Object.keys(paymentAmounts).includes('3')

    if (giftCardPayment && giftcardId) {
      await prisma.giftCards.update({
        where: { id: giftcardId },
        data: { status: 'USED' },
      })
    }

    // Create payments in a transaction
    await prisma.$transaction(
      async (prismaClient: Prisma.TransactionClient) => {
        // Get the user from the database
        const user = await prismaClient.users.findUnique({
          where: { auth0_id: session.user.sub },
          select: { id: true },
        })

        if (!user) {
          throw new Error('User not found in database')
        }

        // Get the order with its items
        const order = await prismaClient.orders.findUnique({
          where: { id: orderId },
          include: {
            OrderItems: true,
          },
        })

        if (!order) {
          throw new Error('Order not found')
        }

        // Create payment records and update cashbox if needed
        for (const [methodId, paymentAmount] of Object.entries(
          paymentAmounts
        )) {
          // Get payment method details to check if it affects cashbox and requires approval
          const paymentMethod = await prismaClient.$queryRaw<
            {
              affects_cashbox: boolean
              requires_approval: boolean
              name: string
            }[]
          >`
          SELECT affects_cashbox, requires_approval, name 
          FROM "PaymentMethods" 
          WHERE id = ${parseInt(methodId)}
        `

          // Create payment record
          const payment = await prismaClient.payments.create({
            data: {
              order_id: orderId,
              payment_method_id: parseInt(methodId),
              amount: parseFloat(paymentAmount as string),
              date: new Date(),
              status: paymentMethod[0]?.requires_approval
                ? REVIEW_PAYMENT_STATUS
                : PAYMENT_STATUS,
            },
          })

          // Update order status based on payment status
          const orderStatus =
            payment.status === PAYMENT_STATUS
              ? APPROVED_ORDER_STATUS
              : REVIEW_PAYMENT_STATUS
          const paymentStatus =
            payment.status === PAYMENT_STATUS
              ? ORDER_PAYMENT_STATUS.PAID
              : REVIEW_PAYMENT_STATUS

          await prismaClient.orders.update({
            where: { id: orderId },
            data: {
              status: orderStatus,
              payment_status: paymentStatus,
              OrderHistory: {
                create: [
                  {
                    status: orderStatus,
                    created_by: user.id,
                    notes: `Order status updated to ${orderStatus}`,
                  },
                  {
                    status: paymentStatus,
                    created_by: user.id,
                    notes: `Payment processed: ${paymentMethod[0]?.name || 'Unknown'} - ${new Intl.NumberFormat(
                      'es-AR',
                      {
                        style: 'currency',
                        currency: 'ARS',
                      }
                    ).format(parseFloat(paymentAmount as string))}`,
                  },
                ],
              },
            },
          })

          // If payment method affects cashbox and payment is approved, update cashbox
          if (
            paymentMethod[0]?.affects_cashbox &&
            payment.status === PAYMENT_STATUS
          ) {
            const currentDate = new Date()
            const paymentAmountFormatted = new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
            }).format(parseFloat(paymentAmount as string))

            // Get or create cashbox for the store
            const cashbox = await prismaClient.cashBoxes.upsert({
              where: {
                id: 1, // Assuming there's a default cashbox with ID 1
              },
              update: {
                current_balance: {
                  increment: parseFloat(paymentAmount as string),
                },
                last_updated: currentDate,
              },
              create: {
                local_name: 'Caja Principal',
                current_balance: parseFloat(paymentAmount as string),
                last_updated: currentDate,
                Store: {
                  connect: {
                    id: order.store_id,
                  },
                },
              },
            })

            // Create cashbox movement record with all required relations
            await prismaClient.cashBoxMovements.create({
              data: {
                CashBoxes: {
                  connect: {
                    id: cashbox.id,
                  },
                },
                Store: {
                  connect: {
                    id: order.store_id,
                  },
                },
                Users_CashBoxMovements_created_byToUsers: {
                  connect: {
                    id: user.id,
                  },
                },
                Users_CashBoxMovements_approved_byToUsers: {
                  connect: {
                    id: user.id,
                  },
                },
                Orders: {
                  connect: {
                    id: orderId,
                  },
                },
                type: 'income',
                amount: parseFloat(paymentAmount as string),
                description: `Pago de orden #${orderId}`,
                date: currentDate,
                status: 'APPROVED',
                approval_date: currentDate,
              },
            })

            // Add order history entry for cashbox update
            await prismaClient.orderHistory.create({
              data: {
                order_id: orderId,
                status: orderStatus,
                created_by: user.id,
                notes: `Cashbox updated: ${paymentAmountFormatted} added to ${cashbox.local_name}`,
              },
            })
          }

          // Update stock only if payment is approved
          if (payment.status === PAYMENT_STATUS) {
            // Update stock for each item in the order
            for (const item of order.OrderItems) {
              if (!item.product_id || !item.quantity) continue

              // Update store inventory
              await prismaClient.storeInventory.updateMany({
                where: {
                  store_id: order.store_id,
                  product_id: item.product_id,
                },
                data: {
                  quantity: {
                    decrement: item.quantity,
                  },
                  available_stock: {
                    decrement: item.quantity,
                  },
                },
              })

              // Create stock movement record
              await prismaClient.stockMovements.create({
                data: {
                  product_id: item.product_id,
                  from_store_id: order.store_id,
                  quantity: item.quantity,
                  type: 'SALE',
                  status: 'COMPLETED',
                  notes: `Sale from order #${orderId}`,
                  created_by: user.id,
                },
              })
            }
          }
        }
      }
    )

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Error processing payment',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
