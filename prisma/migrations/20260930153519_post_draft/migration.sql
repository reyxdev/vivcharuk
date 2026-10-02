-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "draftDocument" JSONB,
ADD COLUMN     "draftUpdatedAt" TIMESTAMPTZ(3);

