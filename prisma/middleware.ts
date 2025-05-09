import { PrismaClient, StoreInventory, StockMovements } from '@prisma/client'

const prisma = new PrismaClient()

// Query performance monitoring
prisma.$use(async (params, next) => {
  const start = Date.now()
  try {
    const result = await next(params)
    const executionTime = Date.now() - start

    // Log performance for queries that take longer than 100ms
    if (executionTime > 100) {
      await prisma.queryPerformance.create({
        data: {
          query_type: `${params.model}.${params.action}`,
          execution_time: executionTime,
          rows_affected: result?.count || 0,
          user_id: (global as any).currentUserId,
        },
      })
    }

    return result
  } catch (error) {
    console.error('Error in query performance monitoring:', error)
    throw error
  }
})

// Middleware to handle audit logging
prisma.$use(async (params, next) => {
  // Store the original result
  const result = await next(params)

  // Only process updates
  if (params.action !== 'update') {
    return result
  }

  try {
    // Get the current user ID from the context
    const userId = (global as any).currentUserId || 0

    if (params.model === 'StoreInventory') {
      // Get the old and new values
      const oldRecord = await prisma.storeInventory.findUnique({
        where: { id: params.args.where.id },
      })

      if (!oldRecord) return result

      // Compare fields and log changes
      const changes = []
      for (const [key, value] of Object.entries(params.args.data)) {
        const typedKey = key as keyof StoreInventory
        if (oldRecord[typedKey] !== value) {
          changes.push({
            store_inventory_id: oldRecord.id,
            field_changed: key,
            old_value: String(oldRecord[typedKey]),
            new_value: String(value),
            changed_by: userId,
            changed_at: new Date(),
          })
        }
      }

      // Create audit records
      if (changes.length > 0) {
        await prisma.storeInventoryAudit.createMany({
          data: changes,
        })
      }
    }

    if (params.model === 'StockMovements') {
      // Get the old and new values
      const oldRecord = await prisma.stockMovements.findUnique({
        where: { id: params.args.where.id },
      })

      if (!oldRecord) return result

      // Compare fields and log changes
      const changes = []
      for (const [key, value] of Object.entries(params.args.data)) {
        const typedKey = key as keyof StockMovements
        if (oldRecord[typedKey] !== value) {
          changes.push({
            stock_movement_id: oldRecord.id,
            field_changed: key,
            old_value: String(oldRecord[typedKey]),
            new_value: String(value),
            changed_by: userId,
            changed_at: new Date(),
          })
        }
      }

      // Create audit records
      if (changes.length > 0) {
        await prisma.stockMovementAudit.createMany({
          data: changes,
        })
      }
    }
  } catch (error) {
    console.error('Error in audit middleware:', error)
    // Don't fail the original operation if audit fails
  }

  return result
})

export default prisma
