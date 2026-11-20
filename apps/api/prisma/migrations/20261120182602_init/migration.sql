-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "businessId" TEXT NOT NULL,
    "senderName" TEXT,
    "senderEmail" TEXT,
    "text" TEXT NOT NULL,
    "category" TEXT,
    "priority" "Priority" NOT NULL,
    "extracted" JSONB NOT NULL,
    "suggestedReply" TEXT,
    "needsHuman" BOOLEAN NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "model" TEXT,
    "latencyMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyUsage" (
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "DailyUsage_pkey" PRIMARY KEY ("day")
);

-- CreateIndex
CREATE INDEX "Message_sessionId_businessId_createdAt_idx" ON "Message"("sessionId", "businessId", "createdAt");
