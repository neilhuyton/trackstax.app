// server/context.ts
import { PrismaClient } from "@prisma/client";
import {
  extractToken,
  verifyTokenAndGetUserId,
  type SupabaseConfig,
} from "@steel-cut/trpc-shared/server";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma = (globalForPrisma.prisma ??= new PrismaClient());

const supabaseUrlFromEnv = process.env.SUPABASE_URL;

console.error("[DEBUG] SUPABASE_URL from env:", supabaseUrlFromEnv ? "PRESENT" : "MISSING/EMPTY");

const supabaseConfig: SupabaseConfig = {
  supabaseUrl: supabaseUrlFromEnv || "https://pdzbvpphnzlbohfqbrmj.supabase.co",
};

export interface Context {
  prisma: PrismaClient;
  userId: string | null;
}

export async function createContext({ req }: { req: Request }): Promise<Context> {
  const token = extractToken(req);
  const userId = await verifyTokenAndGetUserId(token, supabaseConfig);
  return { prisma, userId };
}