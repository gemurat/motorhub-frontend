const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

interface Order {
  id: number
  total_amount: number | null
  status: string
  created_at: Date
  Users: {
    first_name: string
    last_name: string
  } | null
}

async function checkAllOrders() {
  try {
    const orders = await prisma.orders.findMany({
      take: 10,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        Users: true,
      },
    })

    console.log('Found orders:', orders.length)
    orders.forEach((order: Order) => {
      console.log('Order:', {
        id: order.id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        seller: order.Users
          ? `${order.Users.first_name} ${order.Users.last_name}`
          : 'No seller',
      })
    })
  } catch (error) {
    console.error('Error checking orders:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllOrders()
