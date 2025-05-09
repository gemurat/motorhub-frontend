const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Check orders with IN REVIEW status
    const inReviewOrders = await prisma.orders.findMany({
      where: {
        status: 'IN REVIEW',
      },
      include: {
        Payments: {
          include: {
            PaymentMethods: true,
          },
        },
      },
    })

    console.log('Orders with IN REVIEW status:', inReviewOrders)

    // Check payment methods that require approval
    const paymentMethods = await prisma.paymentMethods.findMany({
      where: {
        requires_approval: true,
      },
    })

    console.log('Payment methods that require approval:', paymentMethods)

    // Check recent payments
    const recentPayments = await prisma.payments.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        Orders: true,
        PaymentMethods: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 5,
    })

    console.log('Recent pending payments:', recentPayments)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
