-- CreateEnum
CREATE TYPE "ProductionTrack" AS ENUM ('WOOL', 'HIDE');

-- CreateTable
CREATE TABLE "ProductionStage" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "track" "ProductionTrack" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "photoId" TEXT,
    "videoId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProductionStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionStageTranslation" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "duration" TEXT,
    "temperature" TEXT,
    "machine" TEXT,
    "person" TEXT,
    "source" "TranslationSource" NOT NULL DEFAULT 'HUMAN',
    "sourceHash" TEXT,

    CONSTRAINT "ProductionStageTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductionStage_key_key" ON "ProductionStage"("key");

-- CreateIndex
CREATE INDEX "ProductionStage_track_position_idx" ON "ProductionStage"("track", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionStageTranslation_stageId_locale_key" ON "ProductionStageTranslation"("stageId", "locale");

-- AddForeignKey
ALTER TABLE "ProductionStage" ADD CONSTRAINT "ProductionStage_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionStage" ADD CONSTRAINT "ProductionStage_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionStageTranslation" ADD CONSTRAINT "ProductionStageTranslation_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ProductionStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

