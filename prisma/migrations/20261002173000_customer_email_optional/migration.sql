-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "email" DROP NOT NULL;


-- Rows given a placeholder address before e-mail became optional.
UPDATE "Customer" SET "email" = NULL WHERE "email" LIKE '%@no-email.invalid';
