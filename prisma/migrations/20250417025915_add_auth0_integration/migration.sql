/*
  Warnings:

  - You are about to drop the column `password` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the `stockMovementAudit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `storeInventoryAudit` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[auth0_id]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `Users` required. This step will fail if there are existing NULL values in that column.
*/

-- DropForeignKey
ALTER TABLE "stockMovementAudit" DROP CONSTRAINT "stockMovementAudit_changed_by_fkey";

-- DropForeignKey
ALTER TABLE "stockMovementAudit" DROP CONSTRAINT "stockMovementAudit_stock_movement_id_fkey";

-- DropForeignKey
ALTER TABLE "storeInventoryAudit" DROP CONSTRAINT "storeInventoryAudit_changed_by_fkey";

-- DropForeignKey
ALTER TABLE "storeInventoryAudit" DROP CONSTRAINT "storeInventoryAudit_store_inventory_id_fkey";

-- First, add auth0_id as nullable
ALTER TABLE "Users" 
DROP COLUMN "password",
ADD COLUMN "auth0_id" VARCHAR(255);

-- Set a temporary value for existing records
UPDATE "Users" 
SET "auth0_id" = CONCAT('temp_auth0_', id::text)
WHERE "auth0_id" IS NULL;

-- Now make auth0_id required
ALTER TABLE "Users" 
ALTER COLUMN "auth0_id" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "stockMovementAudit";

-- DropTable
DROP TABLE "storeInventoryAudit";

-- CreateTable
CREATE TABLE "StoreInventoryAudit" (
    "id" SERIAL NOT NULL,
    "store_inventory_id" INTEGER NOT NULL,
    "field_changed" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_by" INTEGER NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreInventoryAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovementAudit" (
    "id" SERIAL NOT NULL,
    "stock_movement_id" INTEGER NOT NULL,
    "field_changed" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_by" INTEGER NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovementAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreInventoryAudit_store_inventory_id_idx" ON "StoreInventoryAudit"("store_inventory_id");

-- CreateIndex
CREATE INDEX "StoreInventoryAudit_changed_by_idx" ON "StoreInventoryAudit"("changed_by");

-- CreateIndex
CREATE INDEX "StoreInventoryAudit_changed_at_idx" ON "StoreInventoryAudit"("changed_at");

-- CreateIndex
CREATE INDEX "StockMovementAudit_stock_movement_id_idx" ON "StockMovementAudit"("stock_movement_id");

-- CreateIndex
CREATE INDEX "StockMovementAudit_changed_by_idx" ON "StockMovementAudit"("changed_by");

-- CreateIndex
CREATE INDEX "StockMovementAudit_changed_at_idx" ON "StockMovementAudit"("changed_at");

-- CreateIndex
CREATE UNIQUE INDEX "Users_auth0_id_key" ON "Users"("auth0_id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_email_idx" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_auth0_id_idx" ON "Users"("auth0_id");

-- CreateIndex
CREATE INDEX "Users_role_idx" ON "Users"("role");

-- CreateIndex
CREATE INDEX "Users_status_idx" ON "Users"("status");

-- CreateIndex
CREATE INDEX "Users_store_id_idx" ON "Users"("store_id");

-- CreateIndex
CREATE INDEX "Users_cashbox_id_idx" ON "Users"("cashbox_id");

-- AddForeignKey
ALTER TABLE "StoreInventoryAudit" ADD CONSTRAINT "StoreInventoryAudit_store_inventory_id_fkey" FOREIGN KEY ("store_inventory_id") REFERENCES "StoreInventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreInventoryAudit" ADD CONSTRAINT "StoreInventoryAudit_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovementAudit" ADD CONSTRAINT "StockMovementAudit_stock_movement_id_fkey" FOREIGN KEY ("stock_movement_id") REFERENCES "StockMovements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovementAudit" ADD CONSTRAINT "StockMovementAudit_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
