-- AlterTable
ALTER TABLE "AttributeDefinition" ADD COLUMN     "options" JSONB;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "hiddenLocales" "Locale"[],
ADD COLUMN     "key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_key_key" ON "Category"("key");

