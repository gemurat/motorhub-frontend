const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create admin user first
  const adminUser = await prisma.users.create({
    data: {
      username: 'admin',
      password: 'admin123', // In production, this should be hashed
      email: 'admin@example.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      is_super_admin: true,
    },
  })

  // Create stores
  const mainStore = await prisma.store.create({
    data: {
      name: 'Main Store',
      address: '123 Main St',
      phone: '555-1234',
      email: 'main@store.com',
      status: 'ACTIVE',
      is_warehouse: false,
    },
  })

  const warehouse = await prisma.store.create({
    data: {
      name: 'Central Warehouse',
      address: '456 Warehouse Ave',
      phone: '555-5678',
      email: 'warehouse@store.com',
      status: 'ACTIVE',
      is_warehouse: true,
    },
  })

  // Create product categories
  const engineParts = await prisma.productCategories.create({
    data: {
      name: 'Engine Parts',
    },
  })

  const brakeParts = await prisma.productCategories.create({
    data: {
      name: 'Brake Parts',
    },
  })

  // Create product brands
  const bosch = await prisma.productBrands.create({
    data: {
      name: 'Bosch',
    },
  })

  const brembo = await prisma.productBrands.create({
    data: {
      name: 'Brembo',
    },
  })

  // Create products
  const oilFilter = await prisma.products.create({
    data: {
      internal_code: 'OF-001',
      description: 'Oil Filter',
      price: 15.99,
      product_category_id: engineParts.id,
      product_brand_id: bosch.id,
      status: 'ACTIVE',
    },
  })

  const brakePads = await prisma.products.create({
    data: {
      internal_code: 'BP-001',
      description: 'Brake Pads Set',
      price: 89.99,
      product_category_id: brakeParts.id,
      product_brand_id: brembo.id,
      status: 'ACTIVE',
    },
  })

  // Create store inventory
  const mainStoreOilFilter = await prisma.storeInventory.create({
    data: {
      store_id: mainStore.id,
      product_id: oilFilter.id,
      quantity: 50,
      reserved_quantity: 5,
      min_stock: 20,
      max_stock: 100,
      status: 'ACTIVE',
    },
  })

  const mainStoreBrakePads = await prisma.storeInventory.create({
    data: {
      store_id: mainStore.id,
      product_id: brakePads.id,
      quantity: 30,
      reserved_quantity: 2,
      min_stock: 10,
      max_stock: 50,
      status: 'ACTIVE',
    },
  })

  const warehouseOilFilter = await prisma.storeInventory.create({
    data: {
      store_id: warehouse.id,
      product_id: oilFilter.id,
      quantity: 200,
      reserved_quantity: 0,
      min_stock: 100,
      max_stock: 500,
      status: 'ACTIVE',
    },
  })

  // Create product batches
  const oilFilterBatch = await prisma.productBatches.create({
    data: {
      product_id: oilFilter.id,
      batch_number: 'BATCH-2024-001',
      expiry_date: new Date('2025-12-31'),
      cost_price: 10.5,
    },
  })

  const brakePadsBatch = await prisma.productBatches.create({
    data: {
      product_id: brakePads.id,
      batch_number: 'BATCH-2024-002',
      expiry_date: new Date('2026-12-31'),
      cost_price: 65.0,
    },
  })

  // Create store inventory batches
  await prisma.storeInventoryBatch.create({
    data: {
      store_inventory_id: mainStoreOilFilter.id,
      batch_id: oilFilterBatch.id,
      quantity: 50,
    },
  })

  await prisma.storeInventoryBatch.create({
    data: {
      store_inventory_id: mainStoreBrakePads.id,
      batch_id: brakePadsBatch.id,
      quantity: 30,
    },
  })

  // Create stock movements
  await prisma.stockMovements.create({
    data: {
      product_id: oilFilter.id,
      from_store_id: warehouse.id,
      to_store_id: mainStore.id,
      quantity: 50,
      type: 'TRANSFER',
      notes: 'Initial stock transfer',
      created_by: adminUser.id,
    },
  })

  // Create stock alerts
  await prisma.stockAlerts.create({
    data: {
      store_id: mainStore.id,
      product_id: oilFilter.id,
      type: 'LOW_STOCK',
      status: 'PENDING',
    },
  })

  // Create store product pricing
  await prisma.storeProductPricing.create({
    data: {
      store_id: mainStore.id,
      product_id: oilFilter.id,
      price: 19.99,
      start_date: new Date('2024-01-01'),
    },
  })

  await prisma.storeProductPricing.create({
    data: {
      store_id: mainStore.id,
      product_id: brakePads.id,
      price: 99.99,
      start_date: new Date('2024-01-01'),
    },
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
