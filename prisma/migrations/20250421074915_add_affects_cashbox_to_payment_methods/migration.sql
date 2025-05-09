-- AlterTable
ALTER TABLE "PaymentMethods" ADD COLUMN     "affects_cashbox" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "name" SET DATA TYPE TEXT;
