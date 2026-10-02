-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "hiddenLocales" SET DEFAULT ARRAY[]::"Locale"[];

UPDATE "Category" SET "hiddenLocales" = ARRAY[]::"Locale"[] WHERE "hiddenLocales" IS NULL;
