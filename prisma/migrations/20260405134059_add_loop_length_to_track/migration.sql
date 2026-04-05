/*
  Warnings:

  - You are about to drop the column `loopLength` on the `audio_tracks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "audio_tracks" DROP COLUMN "loopLength";

-- AlterTable
ALTER TABLE "sampler_tracks" ADD COLUMN     "sampleUrl" TEXT;

-- AlterTable
ALTER TABLE "tracks" ADD COLUMN     "loopLength" INTEGER NOT NULL DEFAULT 4;
