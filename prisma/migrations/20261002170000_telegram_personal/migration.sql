-- AlterTable
ALTER TABLE "StaffUser" ADD COLUMN     "telegramAllowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegramChatId" TEXT,
ADD COLUMN     "telegramLinkedAt" TIMESTAMPTZ(3),
ADD COLUMN     "telegramUsername" TEXT;

-- CreateTable
CREATE TABLE "TelegramLinkCode" (
    "staffUserId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramLinkCode_pkey" PRIMARY KEY ("staffUserId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramLinkCode_codeHash_key" ON "TelegramLinkCode"("codeHash");

-- CreateIndex
CREATE UNIQUE INDEX "StaffUser_telegramChatId_key" ON "StaffUser"("telegramChatId");

