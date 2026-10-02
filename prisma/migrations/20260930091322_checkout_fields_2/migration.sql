-- DropIndex
DROP INDEX "CartItem_cartId_variantId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "customSpec" JSONB,
ADD COLUMN     "specKey" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "amountDueNowMinor" INTEGER,
ADD COLUMN     "prepaymentMinor" INTEGER,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_variantId_specKey_key" ON "CartItem"("cartId", "variantId", "specKey");

