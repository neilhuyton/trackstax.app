import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

function makeSafeFilename(filename: string): string {
  return filename
    .replace(/#/g, "-Sharp")
    .replace(/&/g, "-And")
    .replace(/%/g, "-Percent")
    .replace(/\?/g, "-Question")
    .replace(/=/g, "-Equals")
    .replace(/\+/g, "-Plus")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const folderPathArg = process.argv[2];
  const bpmArg = process.argv[3];
  const forceFlag = process.argv[4] === "--force";

  if (!folderPathArg) {
    console.error("❌ Please provide a folder path");
    console.log("\nUsage:");
    console.log("  npx tsx prisma/seed-samples.ts <folder> [bpm] [--force]");
    console.log("\nExamples:");
    console.log('  npx tsx prisma/seed-samples.ts "./public/this-is-acid" 124');
    console.log(
      '  npx tsx prisma/seed-samples.ts "./public/this-is-acid/bass-loops" 124',
    );
    console.log(
      '  npx tsx prisma/seed-samples.ts "./public/pure-club-bangers/audio-loops" 130 --force',
    );
    process.exit(1);
  }

  const targetPath = path.resolve(folderPathArg);
  const parts = targetPath.split(path.sep).filter(Boolean);

  // Determine collection and subcategory
  let collectionName: string;
  let subcategory: string | null = null;

  if (parts.length >= 3 && parts[parts.length - 3] === "public") {
    // Case: ./public/collection/subcategory
    collectionName = parts[parts.length - 2];
    subcategory = parts[parts.length - 1];
  } else if (parts.length >= 2 && parts[parts.length - 2] === "public") {
    // Case: ./public/collection
    collectionName = parts[parts.length - 1];
    subcategory = null;
  } else {
    // Fallback: use last folder as collection
    collectionName = path.basename(targetPath);
    subcategory = null;
  }

  const bpm = bpmArg ? parseInt(bpmArg, 10) : null;

  if (bpmArg && (isNaN(bpm!) || bpm! < 60 || bpm! > 200)) {
    console.error("❌ BPM must be a number between 60 and 200");
    process.exit(1);
  }

  try {
    await fs.access(targetPath);
  } catch {
    console.error(`❌ Folder not found: ${folderPathArg}`);
    process.exit(1);
  }

  console.log(`🔍 Collection : "${collectionName}"`);
  if (subcategory) console.log(`📂 Subcategory: "${subcategory}"`);
  if (bpm) console.log(`🎵 BPM: ${bpm}`);
  if (!forceFlag) console.log(`🔒 Only-new mode (default)`);
  if (forceFlag) console.log(`⚠️ Force mode enabled`);

  const audioExtensions = new Set([
    ".wav",
    ".mp3",
    ".aiff",
    ".flac",
    ".ogg",
    ".m4a",
  ]);
  let totalProcessed = 0;
  let renamed = 0;
  let inserted = 0;
  let skipped = 0;
  let updated = 0;

  async function processFolder(dirPath: string) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) continue; // We only process files in the target folder

      if (!entry.isFile()) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!audioExtensions.has(ext)) continue;

      const originalFilename = entry.name;
      const safeFilename = makeSafeFilename(originalFilename);

      if (originalFilename !== safeFilename) {
        const newFullPath = path.join(dirPath, safeFilename);
        try {
          await fs.rename(fullPath, newFullPath);
          console.log(`✅ Renamed: ${originalFilename} → ${safeFilename}`);
          renamed++;
        } catch (err) {
          console.error(`❌ Failed to rename ${originalFilename}:`, err);
          continue;
        }
      }

      const collectionSlug = collectionName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const subcategorySlug = subcategory
        ? subcategory
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
        : null;

      let downloadUrl = `/${collectionSlug}`;
      if (subcategorySlug) downloadUrl += `/${subcategorySlug}`;
      downloadUrl += `/${safeFilename}`;

      const existing = await prisma.sample.findFirst({
        where: {
          filename: originalFilename,
          collection: collectionName,
          subcategory: subcategory ?? null,
        },
      });

      if (existing) {
        if (!forceFlag) {
          skipped++;
          totalProcessed++;
          continue;
        }

        await prisma.sample.update({
          where: { id: existing.id },
          data: {
            filename: safeFilename,
            downloadUrl,
            bpm,
          },
        });
        updated++;
      } else {
        await prisma.sample.create({
          data: {
            filename: safeFilename,
            downloadUrl,
            duration: 0,
            bpm,
            key: null,
            collection: collectionName,
            subcategory,
          },
        });
        inserted++;
      }

      totalProcessed++;
    }
  }

  await processFolder(targetPath);

  console.log(`✅ Seeding completed`);
  console.log(`   📊 Total files processed: ${totalProcessed}`);
  console.log(`   🔄 Renamed: ${renamed}`);
  console.log(`   ➕ Inserted: ${inserted}`);
  if (!forceFlag) console.log(`   ⏭️ Skipped: ${skipped}`);
  if (forceFlag && updated > 0) console.log(`   🔄 Updated: ${updated}`);
  if (bpm) console.log(`   🎵 BPM applied: ${bpm}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
