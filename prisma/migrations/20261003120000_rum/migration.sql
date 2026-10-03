-- CreateTable
CREATE TABLE "RumSample" (
    "id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "page" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RumSample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RumSample_createdAt_idx" ON "RumSample"("createdAt");

-- CreateIndex
CREATE INDEX "RumSample_metric_page_createdAt_idx" ON "RumSample"("metric", "page", "createdAt");

