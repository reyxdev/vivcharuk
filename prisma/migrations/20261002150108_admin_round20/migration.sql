-- CreateEnum
CREATE TYPE "ShopPayment" AS ENUM ('CASH', 'CARD_TRANSFER');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "cautionAt" TIMESTAMPTZ(3),
ADD COLUMN     "cautionReason" TEXT;

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "shopSaleId" TEXT;

-- CreateTable
CREATE TABLE "CustomerNote" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSale" (
    "id" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "subtotalMinor" INTEGER NOT NULL,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "totalMinor" INTEGER NOT NULL,
    "payment" "ShopPayment" NOT NULL,
    "cashGivenMinor" INTEGER,
    "receiptRef" TEXT,
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMPTZ(3),
    "cancelledById" TEXT,

    CONSTRAINT "ShopSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffPasskey" (
    "id" TEXT NOT NULL,
    "staffUserId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT[],
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMPTZ(3),

    CONSTRAINT "StaffPasskey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerNote_customerId_createdAt_idx" ON "CustomerNote"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "ShopSale_createdAt_idx" ON "ShopSale"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StaffPasskey_credentialId_key" ON "StaffPasskey"("credentialId");

-- CreateIndex
CREATE INDEX "StaffPasskey_staffUserId_idx" ON "StaffPasskey"("staffUserId");

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
