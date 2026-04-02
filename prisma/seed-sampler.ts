import { PrismaClient } from "@prisma/client";
import type { SamplerPattern } from "../src/types";

const prisma = new PrismaClient();

const defaultPattern: SamplerPattern = [
  { time: "0:0:0", note: "D3", duration: "6n" },
  { time: "0:0:3", note: "D3", duration: "6n" },
  { time: "0:1:2", note: "D3", duration: "6n" },
  { time: "0:2:1", note: "D3", duration: "6n" },
  { time: "0:3:0", note: "D3", duration: "6n" },
  { time: "0:3:2", note: "E3", duration: "6n" },
  { time: "0:4:0", note: "D3", duration: "6n" },
  { time: "0:4:3", note: "D3", duration: "6n" },
  { time: "0:5:2", note: "D3", duration: "6n" },
  { time: "0:6:1", note: "D3", duration: "6n" },
  { time: "0:7:0", note: "D3", duration: "6n" },
  { time: "0:7:2", note: "B2", duration: "6n" },
];

const demoTrackId = "045e5ef1-7b24-49c8-9fd3-fbfc990a6fce";

async function main() {
  if (!demoTrackId) {
    console.error("Please replace demoTrackId with a real track ID");
    return;
  }

  await prisma.samplerTrack.upsert({
    where: {
      trackId: demoTrackId,
    },
    update: {
      pattern: defaultPattern,
    },
    create: {
      trackId: demoTrackId,
      pattern: defaultPattern,
    },
  });

  console.log(
    `Successfully seeded sampler pattern for trackId: ${demoTrackId}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
