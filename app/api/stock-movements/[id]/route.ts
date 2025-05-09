import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const movementId = params.id
    const data = await request.json()
    const { status } = data

    if (!movementId) {
      return NextResponse.json(
        { error: 'Movement ID is required' },
        { status: 400 }
      )
    }

    if (!status || !['COMPLETED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (COMPLETED or REJECTED) is required' },
        { status: 400 }
      )
    }

    // Handle stock movement update in a transaction
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Get the movement
        const movement = await tx.stockMovements.findUnique({
          where: { id: parseInt(movementId) },
          include: {
            Products: true,
            FromStore: true,
            ToStore: true,
          },
        })

        if (!movement) {
          return NextResponse.json(
            { error: 'Stock movement not found' },
            { status: 404 }
          )
        }

        if (movement.status !== 'PENDING') {
          return NextResponse.json(
            {
              error: 'Cannot update movement',
              details: `Movement is already ${movement.status.toLowerCase()}`,
              currentStatus: movement.status,
            },
            { status: 400 }
          )
        }

        // If rejecting, just update the status
        if (status === 'REJECTED') {
          return await tx.stockMovements.update({
            where: { id: parseInt(movementId) },
            data: { status },
          })
        }

        // For approval (COMPLETED), we need to update inventories
        if (movement.from_store_id) {
          // Update source store inventory
          await tx.storeInventory.update({
            where: {
              store_id_product_id: {
                store_id: movement.from_store_id,
                product_id: movement.product_id,
              },
            },
            data: {
              quantity: {
                decrement: movement.quantity,
              },
            },
          })
        }

        if (movement.to_store_id) {
          // Update or create target store inventory
          const toInventory = await tx.storeInventory.findUnique({
            where: {
              store_id_product_id: {
                store_id: movement.to_store_id,
                product_id: movement.product_id,
              },
            },
          })

          if (toInventory) {
            await tx.storeInventory.update({
              where: {
                store_id_product_id: {
                  store_id: movement.to_store_id,
                  product_id: movement.product_id,
                },
              },
              data: {
                quantity: {
                  increment: movement.quantity,
                },
              },
            })
          } else {
            await tx.storeInventory.create({
              data: {
                store_id: movement.to_store_id,
                product_id: movement.product_id,
                quantity: movement.quantity,
                min_stock: 0,
              },
            })
          }

          // Check for stock alerts
          const updatedToInventory = await tx.storeInventory.findUnique({
            where: {
              store_id_product_id: {
                store_id: movement.to_store_id,
                product_id: movement.product_id,
              },
            },
          })

          if (updatedToInventory) {
            // Check for low stock alert
            if (
              updatedToInventory.min_stock !== null &&
              updatedToInventory.quantity <= updatedToInventory.min_stock
            ) {
              // Check if alert already exists
              const existingAlert = await tx.stockAlerts.findUnique({
                where: {
                  store_id_product_id: {
                    store_id: movement.to_store_id,
                    product_id: movement.product_id,
                  },
                },
              })

              if (existingAlert) {
                // Update existing alert if it's resolved
                if (existingAlert.status === 'RESOLVED') {
                  await tx.stockAlerts.update({
                    where: {
                      store_id_product_id: {
                        store_id: movement.to_store_id,
                        product_id: movement.product_id,
                      },
                    },
                    data: {
                      status: 'PENDING',
                      resolved_at: null,
                    },
                  })
                }
              } else {
                // Create new alert if none exists
                await tx.stockAlerts.create({
                  data: {
                    store_id: movement.to_store_id,
                    product_id: movement.product_id,
                    type: 'LOW_STOCK',
                    status: 'PENDING',
                  },
                })
              }
            }

            // Check for overstock alert
            if (
              updatedToInventory.max_stock &&
              updatedToInventory.quantity > updatedToInventory.max_stock
            ) {
              // Check if alert already exists
              const existingAlert = await tx.stockAlerts.findUnique({
                where: {
                  store_id_product_id: {
                    store_id: movement.to_store_id,
                    product_id: movement.product_id,
                  },
                },
              })

              if (existingAlert) {
                // Update existing alert if it's resolved
                if (existingAlert.status === 'RESOLVED') {
                  await tx.stockAlerts.update({
                    where: {
                      store_id_product_id: {
                        store_id: movement.to_store_id,
                        product_id: movement.product_id,
                      },
                    },
                    data: {
                      status: 'PENDING',
                      resolved_at: null,
                    },
                  })
                }
              } else {
                // Create new alert if none exists
                await tx.stockAlerts.create({
                  data: {
                    store_id: movement.to_store_id,
                    product_id: movement.product_id,
                    type: 'OVERSTOCK',
                    status: 'PENDING',
                  },
                })
              }
            }
          }
        }

        // Update the movement status
        return await tx.stockMovements.update({
          where: { id: parseInt(movementId) },
          data: { status },
        })
      }
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating stock movement:', error)
    return NextResponse.json(
      {
        error: 'Error updating stock movement',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
