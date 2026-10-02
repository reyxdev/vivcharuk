-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "draftDocument" JSONB,
ADD COLUMN     "draftUpdatedAt" TIMESTAMPTZ(3),
ADD COLUMN     "draftUpdatedById" TEXT;

