import { PrismaClient } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Test the connection
prisma
  .$connect()
  .then(() => {
    console.log('Successfully connected to the database')
  })
  .catch((error: Error) => {
    console.error('Failed to connect to the database:', error)
    process.exit(1)
  })

export default prisma
