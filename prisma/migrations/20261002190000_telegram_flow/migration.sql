-- AlterTable
ALTER TABLE "StaffUser" ADD COLUMN     "telegramLastSentAt" TIMESTAMPTZ(3),
ADD COLUMN     "telegramPrefs" JSONB;

-- AlterTable
ALTER TABLE "TelegramLinkCode" ADD COLUMN     "tokenHash" TEXT;

-- CreateTable
CREATE TABLE "TelegramMessage" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" INTEGER NOT NULL,
    "orderId" TEXT,
    "hasPhoto" BOOLEAN NOT NULL DEFAULT false,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TelegramMessage_orderId_idx" ON "TelegramMessage"("orderId");

-- CreateIndex
CREATE INDEX "TelegramMessage_createdAt_idx" ON "TelegramMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramLinkCode_tokenHash_key" ON "TelegramLinkCode"("tokenHash");

