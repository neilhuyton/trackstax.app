-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stacks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tempo" DOUBLE PRECISION NOT NULL DEFAULT 132,
    "isLoop" BOOLEAN NOT NULL DEFAULT false,
    "loopStart" INTEGER NOT NULL DEFAULT 0,
    "loopEnd" INTEGER NOT NULL DEFAULT 0,
    "stackId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gridLengthInBars" INTEGER NOT NULL DEFAULT 32,
    "stackId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "screens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volumePercent" INTEGER NOT NULL DEFAULT 75,
    "isMute" BOOLEAN NOT NULL DEFAULT false,
    "stackId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "isMute" BOOLEAN NOT NULL,
    "isSolo" BOOLEAN NOT NULL,
    "isFavourite" BOOLEAN NOT NULL,
    "volumePercent" INTEGER NOT NULL DEFAULT 75,
    "low" INTEGER NOT NULL,
    "mid" INTEGER NOT NULL,
    "high" INTEGER NOT NULL,
    "lowFrequency" INTEGER NOT NULL,
    "highFrequency" INTEGER NOT NULL,
    "isBypass" BOOLEAN NOT NULL,
    "stackId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "durations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "start" INTEGER NOT NULL,
    "stop" INTEGER NOT NULL,
    "trackId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "durations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_tracks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "filename" TEXT NOT NULL,
    "downloadUrl" TEXT,
    "loopLength" INTEGER NOT NULL,
    "offset" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pitch" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timestretch" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "fullDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sampleId" UUID,
    "trackId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audio_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coverImage" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "samples" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "filename" TEXT NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bpm" INTEGER,
    "key" TEXT,
    "collectionName" TEXT NOT NULL,
    "subcategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "samples_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "stacks_userId_sortOrder_idx" ON "stacks"("userId", "sortOrder");

-- CreateIndex
CREATE INDEX "stacks_userId_idx" ON "stacks"("userId");

-- CreateIndex
CREATE INDEX "stacks_sortOrder_idx" ON "stacks"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "transports_stackId_key" ON "transports"("stackId");

-- CreateIndex
CREATE INDEX "transports_stackId_idx" ON "transports"("stackId");

-- CreateIndex
CREATE UNIQUE INDEX "screens_stackId_key" ON "screens"("stackId");

-- CreateIndex
CREATE INDEX "screens_stackId_idx" ON "screens"("stackId");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_stackId_key" ON "destinations"("stackId");

-- CreateIndex
CREATE INDEX "destinations_stackId_idx" ON "destinations"("stackId");

-- CreateIndex
CREATE INDEX "tracks_stackId_sortOrder_idx" ON "tracks"("stackId", "sortOrder");

-- CreateIndex
CREATE INDEX "tracks_stackId_idx" ON "tracks"("stackId");

-- CreateIndex
CREATE INDEX "durations_trackId_idx" ON "durations"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "audio_tracks_trackId_key" ON "audio_tracks"("trackId");

-- CreateIndex
CREATE INDEX "audio_tracks_trackId_idx" ON "audio_tracks"("trackId");

-- CreateIndex
CREATE INDEX "audio_tracks_sampleId_idx" ON "audio_tracks"("sampleId");

-- CreateIndex
CREATE UNIQUE INDEX "collections_name_key" ON "collections"("name");

-- CreateIndex
CREATE UNIQUE INDEX "collections_slug_key" ON "collections"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "samples_downloadUrl_key" ON "samples"("downloadUrl");

-- CreateIndex
CREATE INDEX "samples_collectionName_subcategory_bpm_idx" ON "samples"("collectionName", "subcategory", "bpm");

-- CreateIndex
CREATE UNIQUE INDEX "samples_filename_collectionName_subcategory_key" ON "samples"("filename", "collectionName", "subcategory");

-- AddForeignKey
ALTER TABLE "stacks" ADD CONSTRAINT "stacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transports" ADD CONSTRAINT "transports_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "stacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screens" ADD CONSTRAINT "screens_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "stacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "stacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "stacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "durations" ADD CONSTRAINT "durations_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_tracks" ADD CONSTRAINT "audio_tracks_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "samples"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_tracks" ADD CONSTRAINT "audio_tracks_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_collectionName_fkey" FOREIGN KEY ("collectionName") REFERENCES "collections"("name") ON DELETE CASCADE ON UPDATE CASCADE;
