-- CreateTable
CREATE TABLE "CashBoxMovements" (
    "id" SERIAL NOT NULL,
    "cash_box_id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "order_id" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "created_by" INTEGER NOT NULL,
    "approved_by" INTEGER,
    "approval_date" TIMESTAMP(6),
    "rejection_reason" TEXT,

    CONSTRAINT "CashBoxMovements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashBoxes" (
    "id" SERIAL NOT NULL,
    "local_name" VARCHAR(250) NOT NULL,
    "current_balance" DECIMAL(10,2) NOT NULL,
    "last_updated" TIMESTAMP(6) NOT NULL,
    "store_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashBoxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clients" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(250),
    "email" VARCHAR(250),
    "phone" VARCHAR(50),

    CONSTRAINT "Clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCards" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "customer_id" VARCHAR(50),
    "balance" DECIMAL(10,2) NOT NULL,
    "issue_date" TIMESTAMP(6) NOT NULL,
    "expiry_date" TIMESTAMP(6),
    "status" VARCHAR(50) NOT NULL,

    CONSTRAINT "GiftCards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalOrderItems" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "LocalOrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalOrders" (
    "id" SERIAL NOT NULL,
    "order_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplier_id" INTEGER NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "vale" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "LocalOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItems" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER,
    "product_id" INTEGER,
    "quantity" INTEGER,
    "price" DECIMAL(10,2),

    CONSTRAINT "OrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "customer_id" VARCHAR(50),
    "order_date" TIMESTAMP(6),
    "total_amount" DECIMAL(10,2),
    "seller_id" INTEGER,
    "status" VARCHAR(50) NOT NULL,
    "order_type" VARCHAR(50) NOT NULL DEFAULT 'REGULAR',
    "payment_status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "delivery_status" VARCHAR(50),
    "notes" VARCHAR(1000),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderHistory" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "notes" VARCHAR(500),
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethods" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PaymentMethods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "payment_method_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "approval_date" TIMESTAMP(6),
    "approved_by" INTEGER,
    "rejection_reason" VARCHAR(500),

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBrands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductBrands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCompatibility" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "vehicle_model_id" INTEGER,

    CONSTRAINT "ProductCompatibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "internal_code" VARCHAR(250),
    "description" TEXT,
    "price" DECIMAL(10,2),
    "product_brand_id" INTEGER,
    "product_category_id" INTEGER,
    "measurements" VARCHAR(250),
    "brand_id" VARCHAR(250),
    "model_id" VARCHAR(250),
    "year" VARCHAR(50),
    "moneda" VARCHAR(50),
    "codigo_parte" VARCHAR(250),
    "codigo_original" VARCHAR(250),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreInventory" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "min_stock" INTEGER,
    "max_stock" INTEGER,
    "available_stock" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Returns" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "return_date" TIMESTAMP(6) NOT NULL,
    "type" VARCHAR(50) NOT NULL,

    CONSTRAINT "Returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suppliers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(250),
    "contact_info" TEXT,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(250),
    "password" VARCHAR(250),
    "email" VARCHAR(250),
    "role" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "store_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(6),
    "permissions" VARCHAR(1000),
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "cashbox_id" INTEGER,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStoreAccess" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStoreAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleBrands" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(250),

    CONSTRAINT "VehicleBrands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleModels" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(250),
    "vehicle_brand_id" INTEGER,

    CONSTRAINT "VehicleModels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "address" VARCHAR(500),
    "phone" VARCHAR(50),
    "email" VARCHAR(250),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "logo_url" VARCHAR(500),
    "business_hours" VARCHAR(500),
    "parent_store_id" INTEGER,
    "is_warehouse" BOOLEAN NOT NULL DEFAULT false,
    "storage_capacity" INTEGER,
    "storage_units" VARCHAR(50),
    "type" VARCHAR(50) NOT NULL DEFAULT 'STORE',

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreProductPricing" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),

    CONSTRAINT "StoreProductPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorePaymentMethods" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "payment_method_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StorePaymentMethods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorePromotions" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "description" VARCHAR(500),
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "discount" DECIMAL(5,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StorePromotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreReports" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "report_type" VARCHAR(50) NOT NULL,
    "period" VARCHAR(50) NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreReports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreCashRegisterSettings" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "cash_register_id" INTEGER NOT NULL,
    "settings" JSONB NOT NULL,

    CONSTRAINT "StoreCashRegisterSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovements" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "from_store_id" INTEGER,
    "to_store_id" INTEGER,
    "quantity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "StockMovements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBatches" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "batch_number" VARCHAR(100) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "cost_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductBatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreInventoryBatch" (
    "id" SERIAL NOT NULL,
    "store_inventory_id" INTEGER NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StoreInventoryBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAlerts" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "StockAlerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseZone" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "capacity" INTEGER,

    CONSTRAINT "WarehouseZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storeInventoryAudit" (
    "id" SERIAL NOT NULL,
    "store_inventory_id" INTEGER NOT NULL,
    "field_changed" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_by" INTEGER NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storeInventoryAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stockMovementAudit" (
    "id" SERIAL NOT NULL,
    "stock_movement_id" INTEGER NOT NULL,
    "field_changed" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_by" INTEGER NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stockMovementAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventorySummaryView" (
    "id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "current_stock" INTEGER NOT NULL,
    "reserved_stock" INTEGER NOT NULL,
    "available_stock" INTEGER NOT NULL,
    "last_movement" TIMESTAMP(3) NOT NULL,
    "needs_restock" BOOLEAN NOT NULL,
    "is_overstocked" BOOLEAN NOT NULL,

    CONSTRAINT "InventorySummaryView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LowStockAlertView" (
    "id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "current_stock" INTEGER NOT NULL,
    "min_stock" INTEGER NOT NULL,
    "difference" INTEGER NOT NULL,

    CONSTRAINT "LowStockAlertView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverstockAlertView" (
    "id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "current_stock" INTEGER NOT NULL,
    "max_stock" INTEGER NOT NULL,
    "difference" INTEGER NOT NULL,

    CONSTRAINT "OverstockAlertView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queryPerformance" (
    "id" SERIAL NOT NULL,
    "query_type" TEXT NOT NULL,
    "execution_time" INTEGER NOT NULL,
    "rows_affected" INTEGER NOT NULL,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queryPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StoreInventoryStockMovements" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StoreInventoryStockMovements_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiftCards_code_key" ON "GiftCards"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBrands_name_key" ON "ProductBrands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategories_name_key" ON "ProductCategories"("name");

-- CreateIndex
CREATE INDEX "Products_status_idx" ON "Products"("status");

-- CreateIndex
CREATE INDEX "Products_internal_code_idx" ON "Products"("internal_code");

-- CreateIndex
CREATE INDEX "StoreInventory_store_id_status_idx" ON "StoreInventory"("store_id", "status");

-- CreateIndex
CREATE INDEX "StoreInventory_product_id_status_idx" ON "StoreInventory"("product_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StoreInventory_store_id_product_id_key" ON "StoreInventory"("store_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserStoreAccess_user_id_store_id_key" ON "UserStoreAccess"("user_id", "store_id");

-- CreateIndex
CREATE INDEX "Store_status_idx" ON "Store"("status");

-- CreateIndex
CREATE INDEX "Store_is_warehouse_idx" ON "Store"("is_warehouse");

-- CreateIndex
CREATE UNIQUE INDEX "StoreProductPricing_store_id_product_id_start_date_key" ON "StoreProductPricing"("store_id", "product_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "StorePaymentMethods_store_id_payment_method_id_key" ON "StorePaymentMethods"("store_id", "payment_method_id");

-- CreateIndex
CREATE UNIQUE INDEX "StoreCashRegisterSettings_store_id_cash_register_id_key" ON "StoreCashRegisterSettings"("store_id", "cash_register_id");

-- CreateIndex
CREATE INDEX "StockMovements_product_id_type_idx" ON "StockMovements"("product_id", "type");

-- CreateIndex
CREATE INDEX "StockMovements_from_store_id_status_idx" ON "StockMovements"("from_store_id", "status");

-- CreateIndex
CREATE INDEX "StockMovements_to_store_id_status_idx" ON "StockMovements"("to_store_id", "status");

-- CreateIndex
CREATE INDEX "ProductBatches_expiry_date_idx" ON "ProductBatches"("expiry_date");

-- CreateIndex
CREATE INDEX "ProductBatches_product_id_expiry_date_idx" ON "ProductBatches"("product_id", "expiry_date");

-- CreateIndex
CREATE INDEX "StoreInventoryBatch_store_inventory_id_idx" ON "StoreInventoryBatch"("store_inventory_id");

-- CreateIndex
CREATE INDEX "StoreInventoryBatch_batch_id_idx" ON "StoreInventoryBatch"("batch_id");

-- CreateIndex
CREATE INDEX "StoreInventoryBatch_quantity_idx" ON "StoreInventoryBatch"("quantity");

-- CreateIndex
CREATE INDEX "StoreInventoryBatch_store_inventory_id_batch_id_idx" ON "StoreInventoryBatch"("store_inventory_id", "batch_id");

-- CreateIndex
CREATE INDEX "StoreInventoryBatch_quantity_batch_id_idx" ON "StoreInventoryBatch"("quantity", "batch_id");

-- CreateIndex
CREATE INDEX "StockAlerts_status_idx" ON "StockAlerts"("status");

-- CreateIndex
CREATE INDEX "StockAlerts_created_at_idx" ON "StockAlerts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "StockAlerts_store_id_product_id_key" ON "StockAlerts"("store_id", "product_id");

-- CreateIndex
CREATE INDEX "storeInventoryAudit_store_inventory_id_idx" ON "storeInventoryAudit"("store_inventory_id");

-- CreateIndex
CREATE INDEX "storeInventoryAudit_changed_by_idx" ON "storeInventoryAudit"("changed_by");

-- CreateIndex
CREATE INDEX "storeInventoryAudit_changed_at_idx" ON "storeInventoryAudit"("changed_at");

-- CreateIndex
CREATE INDEX "stockMovementAudit_stock_movement_id_idx" ON "stockMovementAudit"("stock_movement_id");

-- CreateIndex
CREATE INDEX "stockMovementAudit_changed_by_idx" ON "stockMovementAudit"("changed_by");

-- CreateIndex
CREATE INDEX "stockMovementAudit_changed_at_idx" ON "stockMovementAudit"("changed_at");

-- CreateIndex
CREATE INDEX "InventorySummaryView_store_id_product_id_idx" ON "InventorySummaryView"("store_id", "product_id");

-- CreateIndex
CREATE INDEX "InventorySummaryView_needs_restock_idx" ON "InventorySummaryView"("needs_restock");

-- CreateIndex
CREATE INDEX "InventorySummaryView_is_overstocked_idx" ON "InventorySummaryView"("is_overstocked");

-- CreateIndex
CREATE INDEX "LowStockAlertView_store_id_product_id_idx" ON "LowStockAlertView"("store_id", "product_id");

-- CreateIndex
CREATE INDEX "LowStockAlertView_difference_idx" ON "LowStockAlertView"("difference");

-- CreateIndex
CREATE INDEX "OverstockAlertView_store_id_product_id_idx" ON "OverstockAlertView"("store_id", "product_id");

-- CreateIndex
CREATE INDEX "OverstockAlertView_difference_idx" ON "OverstockAlertView"("difference");

-- CreateIndex
CREATE INDEX "_StoreInventoryStockMovements_B_index" ON "_StoreInventoryStockMovements"("B");

-- AddForeignKey
ALTER TABLE "CashBoxMovements" ADD CONSTRAINT "CashBoxMovements_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CashBoxMovements" ADD CONSTRAINT "CashBoxMovements_cash_box_id_fkey" FOREIGN KEY ("cash_box_id") REFERENCES "CashBoxes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CashBoxMovements" ADD CONSTRAINT "CashBoxMovements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CashBoxMovements" ADD CONSTRAINT "CashBoxMovements_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashBoxMovements" ADD CONSTRAINT "fk_cashbox_movements_order" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CashBoxes" ADD CONSTRAINT "CashBoxes_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCards" ADD CONSTRAINT "GiftCards_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LocalOrderItems" ADD CONSTRAINT "LocalOrderItems_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LocalOrders" ADD CONSTRAINT "LocalOrders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalOrders" ADD CONSTRAINT "LocalOrders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderHistory" ADD CONSTRAINT "OrderHistory_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderHistory" ADD CONSTRAINT "OrderHistory_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "PaymentMethods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductCompatibility" ADD CONSTRAINT "ProductCompatibility_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductCompatibility" ADD CONSTRAINT "ProductCompatibility_vehicle_model_id_fkey" FOREIGN KEY ("vehicle_model_id") REFERENCES "VehicleModels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_product_brand_id_fkey" FOREIGN KEY ("product_brand_id") REFERENCES "ProductBrands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "ProductCategories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "StoreInventory" ADD CONSTRAINT "StoreInventory_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreInventory" ADD CONSTRAINT "StoreInventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_cashbox_id_fkey" FOREIGN KEY ("cashbox_id") REFERENCES "CashBoxes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStoreAccess" ADD CONSTRAINT "UserStoreAccess_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStoreAccess" ADD CONSTRAINT "UserStoreAccess_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleModels" ADD CONSTRAINT "VehicleModels_vehicle_brand_id_fkey" FOREIGN KEY ("vehicle_brand_id") REFERENCES "VehicleBrands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_parent_store_id_fkey" FOREIGN KEY ("parent_store_id") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreProductPricing" ADD CONSTRAINT "StoreProductPricing_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreProductPricing" ADD CONSTRAINT "StoreProductPricing_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorePaymentMethods" ADD CONSTRAINT "StorePaymentMethods_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "PaymentMethods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorePaymentMethods" ADD CONSTRAINT "StorePaymentMethods_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorePromotions" ADD CONSTRAINT "StorePromotions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReports" ADD CONSTRAINT "StoreReports_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCashRegisterSettings" ADD CONSTRAINT "StoreCashRegisterSettings_cash_register_id_fkey" FOREIGN KEY ("cash_register_id") REFERENCES "CashBoxes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCashRegisterSettings" ADD CONSTRAINT "StoreCashRegisterSettings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovements" ADD CONSTRAINT "StockMovements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovements" ADD CONSTRAINT "StockMovements_from_store_id_fkey" FOREIGN KEY ("from_store_id") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovements" ADD CONSTRAINT "StockMovements_to_store_id_fkey" FOREIGN KEY ("to_store_id") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovements" ADD CONSTRAINT "StockMovements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBatches" ADD CONSTRAINT "ProductBatches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreInventoryBatch" ADD CONSTRAINT "StoreInventoryBatch_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "ProductBatches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreInventoryBatch" ADD CONSTRAINT "StoreInventoryBatch_store_inventory_id_fkey" FOREIGN KEY ("store_inventory_id") REFERENCES "StoreInventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlerts" ADD CONSTRAINT "StockAlerts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlerts" ADD CONSTRAINT "StockAlerts_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlerts" ADD CONSTRAINT "StockAlerts_store_id_product_id_fkey" FOREIGN KEY ("store_id", "product_id") REFERENCES "StoreInventory"("store_id", "product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseZone" ADD CONSTRAINT "WarehouseZone_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storeInventoryAudit" ADD CONSTRAINT "storeInventoryAudit_store_inventory_id_fkey" FOREIGN KEY ("store_inventory_id") REFERENCES "StoreInventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storeInventoryAudit" ADD CONSTRAINT "storeInventoryAudit_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockMovementAudit" ADD CONSTRAINT "stockMovementAudit_stock_movement_id_fkey" FOREIGN KEY ("stock_movement_id") REFERENCES "StockMovements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockMovementAudit" ADD CONSTRAINT "stockMovementAudit_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySummaryView" ADD CONSTRAINT "InventorySummaryView_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySummaryView" ADD CONSTRAINT "InventorySummaryView_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LowStockAlertView" ADD CONSTRAINT "LowStockAlertView_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LowStockAlertView" ADD CONSTRAINT "LowStockAlertView_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverstockAlertView" ADD CONSTRAINT "OverstockAlertView_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverstockAlertView" ADD CONSTRAINT "OverstockAlertView_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StoreInventoryStockMovements" ADD CONSTRAINT "_StoreInventoryStockMovements_A_fkey" FOREIGN KEY ("A") REFERENCES "StockMovements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StoreInventoryStockMovements" ADD CONSTRAINT "_StoreInventoryStockMovements_B_fkey" FOREIGN KEY ("B") REFERENCES "StoreInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
