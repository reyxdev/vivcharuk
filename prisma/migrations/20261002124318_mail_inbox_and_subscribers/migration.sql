-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED', 'BOUNCED');

-- AlterEnum
ALTER TYPE "MailSenderAction" ADD VALUE 'VIP';

-- AlterTable
ALTER TABLE "MailMessage" ADD COLUMN     "imapFolder" TEXT,
ADD COLUMN     "imapUid" INTEGER;

-- AlterTable
ALTER TABLE "MailThread" ADD COLUMN     "autoRepliedAt" TIMESTAMPTZ(3),
ADD COLUMN     "deletedAt" TIMESTAMPTZ(3),
ADD COLUMN     "labels" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "emailBouncedAt" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "MailNote" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MailNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'PENDING',
    "locale" "Locale" NOT NULL DEFAULT 'uk',
    "source" TEXT NOT NULL,
    "consentText" TEXT,
    "consentAt" TIMESTAMPTZ(3),
    "confirmToken" TEXT,
    "confirmedAt" TIMESTAMPTZ(3),
    "unsubToken" TEXT NOT NULL,
    "unsubscribedAt" TIMESTAMPTZ(3),
    "bounceCount" INTEGER NOT NULL DEFAULT 0,
    "orderId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MailNote_threadId_createdAt_idx" ON "MailNote"("threadId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_confirmToken_key" ON "Subscriber"("confirmToken");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_unsubToken_key" ON "Subscriber"("unsubToken");

-- CreateIndex
CREATE INDEX "Subscriber_status_idx" ON "Subscriber"("status");

-- CreateIndex
CREATE INDEX "MailMessage_imapFolder_imapUid_idx" ON "MailMessage"("imapFolder", "imapUid");

-- AddForeignKey
ALTER TABLE "MailNote" ADD CONSTRAINT "MailNote_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MailThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
