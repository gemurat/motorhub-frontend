import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function cleanupOldAuditRecords() {
  try {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    // Delete old records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const storeInventoryResult = await tx.storeInventoryAudit.deleteMany({
        where: {
          changed_at: {
            lt: oneYearAgo,
          },
        },
      })

      const stockMovementResult = await tx.stockMovementAudit.deleteMany({
        where: {
          changed_at: {
            lt: oneYearAgo,
          },
        },
      })

      return {
        storeInventoryDeleted: storeInventoryResult.count,
        stockMovementDeleted: stockMovementResult.count,
      }
    })

    return {
      success: true,
      message: 'Old audit records cleaned up successfully',
      deletedCounts: result,
    }
  } catch (error) {
    console.error('Error cleaning up audit records:', error)
    return {
      success: false,
      message: 'Failed to clean up audit records',
      error,
    }
  }
}
