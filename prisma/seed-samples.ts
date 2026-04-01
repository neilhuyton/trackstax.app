/**
 * SAMPLE LIBRARY SEEDER - LONG TERM SOLUTION (Optimized)
 *
 * Faster version using bulk operations.
 */

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

function normalizeForExtraction(filename: string): string {
  return filename.replace(/_/g, "-");
}

const VALID_KEYS = [
  "A#MINOR",
  "A#MAJOR",
  "A#M",
  "A#",
  "Bbm",
  "Ebm",
  "Abm",
  "Dbm",
  "Gbm",
  "C#m",
  "D#m",
  "F#m",
  "G#m",
  "A#m",
  "Cm",
  "Dm",
  "Em",
  "Fm",
  "Gm",
  "Am",
  "Bm",
  "Bbminor",
  "Ebminor",
  "Abminor",
  "Dbminor",
  "Gbminor",
  "C#minor",
  "D#minor",
  "F#minor",
  "G#minor",
  "A#minor",
  "Cminor",
  "Dminor",
  "Eminor",
  "Fminor",
  "Gminor",
  "Aminor",
  "Bminor",
  "Bb",
  "Eb",
  "Ab",
  "Db",
  "Gb",
  "C#",
  "D#",
  "F#",
  "G#",
  "A#",
  "C",
  "D",
  "E",
  "F",
  "G",
  "A",
  "B",
].sort((a, b) => b.length - a.length);

function extractBpmAndKey(filename: string): {
  bpm: number | null;
  key: string | null;
} {
  const normalized = normalizeForExtraction(filename).toUpperCase();

  let bpm: number | null = null;

  const bpmExplicit = normalized.match(/(\d{2,3})\s*BPM/i);
  if (bpmExplicit) bpm = parseInt(bpmExplicit[1], 10);

  if (!bpm) {
    const bpmSep = normalized.match(/[-](\d{2,3})[-]/);
    if (bpmSep) bpm = parseInt(bpmSep[1], 10);
  }

  if (!bpm) {
    const bpmAny = normalized.match(
      /\b(6[0-9]|[7-9][0-9]|1[0-9]{2}|2[0-1][0-9]|220)\b/,
    );
    if (bpmAny) bpm = parseInt(bpmAny[1], 10);
  }

  let key: string | null = null;

  // 1. Key at the very end (before .extension) - best for WN-130 files
  const endKeyMatch = normalized.match(
    /[-]([A-G][#B]?[A-Za-z0-9]*?)(?:\.(?:WAV|MP3|AIFF|FLAC|OGG|M4A))$/i,
  );
  if (endKeyMatch) {
    let extracted = endKeyMatch[1];
    extracted = makeSafeFilename(extracted);
    extracted = extracted
      .replace(/MINOR|MAJOR|MIN|MAJ|M|FLAT|SUS4|[0-9]$/i, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (/^(BB|EB|AB|DB|GB)$/i.test(extracted)) {
      key = extracted[0].toUpperCase() + extracted[1].toLowerCase();
    } else if (/^[A-G](?:-Sharp)?$/i.test(extracted)) {
      key = extracted;
    }
  }

  // 2. Key right after BPM number
  if (!key && bpm) {
    const afterBpmMatch = normalized.match(
      new RegExp(`[-]${bpm}[-]?([A-G][#B]?[A-Za-z0-9]*)`, "i"),
    );
    if (afterBpmMatch) {
      let extracted = afterBpmMatch[1];
      extracted = makeSafeFilename(extracted);
      extracted = extracted
        .replace(/MINOR|MAJOR|MIN|MAJ|M|FLAT|SUS4|[0-9]$/i, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      if (/^(BB|EB|AB|DB|GB)$/i.test(extracted)) {
        key = extracted[0].toUpperCase() + extracted[1].toLowerCase();
      } else if (/^[A-G](?:-Sharp)?$/i.test(extracted)) {
        key = extracted;
      }
    }
  }

  // 3. General key matching
  if (!key) {
    for (const possible of VALID_KEYS) {
      const regex = new RegExp(
        `[-]${possible}(?:MINOR|MAJOR|MIN|MAJ|M|FLAT|SUS4|[0-9])?(?:[-]|$)`,
        "i",
      );
      const match = normalized.match(regex);
      if (match) {
        let extracted = match[0].slice(1);
        extracted = makeSafeFilename(extracted);
        extracted = extracted
          .replace(/MINOR|MAJOR|MIN|MAJ|M|FLAT|SUS4|[0-9]$/i, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

        if (/^(BB|EB|AB|DB|GB)$/i.test(extracted)) {
          key = extracted[0].toUpperCase() + extracted[1].toLowerCase();
          break;
        }
        if (/^[A-G](?:-Sharp)?$/i.test(extracted)) {
          key = extracted;
          break;
        }
      }
    }
  }

  return { bpm, key };
}

const collectionMetadata: Record<
  string,
  { coverImage?: string; description?: string }
> = {
  "90s-rave": {
    coverImage: "/images/collections/90s-rave.jpg",
  },
  "90s-rave-2": {
    coverImage: "/images/collections/90s-rave-2.jpg",
  },
  "abstract-oldskool-breaks-and-rave": {
    coverImage: "/images/collections/abstract-oldskool-breaks-and-rave.jpg",
  },
  "abstract-oldskool-jungle": {
    coverImage: "/images/collections/abstract-oldskool-jungle.jpg",
  },
  "jungle-warfare-1": {
    coverImage: "/images/collections/jungle-warfare-1.jpg",
  },
  "pure-club-bangers": {
    coverImage: "/images/collections/pure-club-bangers.jpg",
  },
  "rave-synths": {
    coverImage: "/images/collections/rave-synths.jpg",
  },
  "retro-house-and-old-school-rave": {
    coverImage: "/images/collections/retro-house-and-old-school-rave.jpg",
  },
  "this-is-acid": {
    coverImage: "/images/collections/this-is-acid.jpg",
  },
};

async function main() {
  const folderPathArg = process.argv[2];
  const forceFlag = process.argv[3] === "--force";

  if (!folderPathArg) {
    console.error("❌ Please provide a folder path");
    console.log("\nUsage: npx tsx prisma/seed-samples.ts <folder> [--force]");
    process.exit(1);
  }

  const targetPath = path.resolve(folderPathArg);
  const publicPath = path.resolve("public");

  const isParentCollectionsFolder =
    path.basename(targetPath) === "collections" &&
    targetPath.includes("public");

  if (isParentCollectionsFolder) {
    console.log("📂 Seeding all collections...\n");
    await seedAllCollections(targetPath, forceFlag, publicPath);
  } else {
    await seedSingleCollection(targetPath, forceFlag, publicPath);
  }
}

async function seedAllCollections(
  collectionsDir: string,
  forceFlag: boolean,
  publicPath: string,
) {
  const entries = await fs.readdir(collectionsDir, { withFileTypes: true });
  const collectionFolders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  if (collectionFolders.length === 0) {
    console.log("❌ No collection folders found");
    return;
  }

  console.log(`Found ${collectionFolders.length} collections. Starting...\n`);

  for (const collectionName of collectionFolders) {
    const collectionPath = path.join(collectionsDir, collectionName);
    console.log(`→ Seeding: ${collectionName}`);
    await seedSingleCollection(collectionPath, forceFlag, publicPath);
    console.log("");
  }

  console.log("✅ All collections seeded successfully!\n");
}

async function seedSingleCollection(
  targetPath: string,
  forceFlag: boolean,
  publicPath: string,
) {
  const relativePath = path.relative(publicPath, targetPath);
  const relativeParts = relativePath.split(path.sep).filter(Boolean);

  const collectionName =
    relativeParts.length >= 2 && relativeParts[0] === "collections"
      ? relativeParts[1]
      : path.basename(targetPath);

  const metadata = collectionMetadata[collectionName] || {};

  await prisma.collection.upsert({
    where: { name: collectionName },
    update: {
      coverImage: metadata.coverImage,
      description: metadata.description,
    },
    create: {
      name: collectionName,
      slug: collectionName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, ""),
      coverImage: metadata.coverImage,
      description: metadata.description,
    },
  });

  const audioExtensions = new Set([
    ".wav",
    ".mp3",
    ".aiff",
    ".flac",
    ".ogg",
    ".m4a",
  ]);

  let totalProcessed = 0;

  const samplesToUpsert: Array<{
    filename: string;
    downloadUrl: string;
    duration: number;
    bpm: number | null;
    key: string | null;
    collectionName: string;
    subcategory: string;
  }> = [];

  async function processFolder(
    dirPath: string,
    currentSubcategory: string | null,
  ) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await processFolder(fullPath, entry.name);
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (!audioExtensions.has(ext)) continue;

      const originalFilename = entry.name;
      const safeFilename = makeSafeFilename(originalFilename);
      const { bpm, key } = extractBpmAndKey(originalFilename);

      if (originalFilename !== safeFilename) {
        try {
          await fs.rename(fullPath, path.join(dirPath, safeFilename));
        } catch {
          console.warn(`⚠️ Could not rename ${originalFilename}`);
        }
      }

      const fileRelativePath = path.relative(
        publicPath,
        path.join(dirPath, safeFilename),
      );
      const downloadUrl = `/${fileRelativePath.replace(/\\/g, "/")}`;

      samplesToUpsert.push({
        filename: safeFilename,
        downloadUrl,
        duration: 0,
        bpm,
        key,
        collectionName,
        subcategory: currentSubcategory ?? "",
      });

      totalProcessed++;
      if (totalProcessed % 100 === 0) process.stdout.write(".");
    }
  }

  await processFolder(targetPath, null);

  // Bulk insert - much faster than individual creates
  if (samplesToUpsert.length > 0) {
    console.log(
      `\nUpserting ${samplesToUpsert.length} samples for ${collectionName}...`,
    );

    await prisma.sample.createMany({
      data: samplesToUpsert,
      skipDuplicates: true,
    });

    // If --force is used, update existing records with new metadata
    if (forceFlag) {
      console.log("Force mode: Updating existing records...");
      for (const sample of samplesToUpsert) {
        await prisma.sample.updateMany({
          where: { downloadUrl: sample.downloadUrl },
          data: {
            filename: sample.filename,
            bpm: sample.bpm,
            key: sample.key,
            subcategory: sample.subcategory,
          },
        });
      }
    }
  }

  console.log(`\n✅ ${collectionName} — ${totalProcessed} files processed`);
}

main()
  .catch((e) => {
    console.error("\n❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
