// server/context.ts
import { PrismaClient } from "@prisma/client";
import { extractToken } from "@steel-cut/trpc-shared/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma = (globalForPrisma.prisma ??= new PrismaClient());

const SUPABASE_URL = "https://pdzbvpphnzlbohfqbrmj.supabase.co";   // ← CHANGE THIS

let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null;
let ISSUER: string | null = null;

function getSupabaseConfig() {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL is not configured");
  }

  if (!JWKS || !ISSUER) {
    ISSUER = `${SUPABASE_URL}/auth/v1`;
    JWKS = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
  }

  return { JWKS: JWKS!, ISSUER: ISSUER! };
}

export async function verifyTokenAndGetUserId(token: string | null): Promise<string | null> {
  if (!token) return null;

  const { JWKS, ISSUER } = getSupabaseConfig();

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      audience: "authenticated",
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch (err) {
    console.warn("JWT verification failed:", err);
    return null;
  }
}

export interface Context {
  prisma: PrismaClient;
  userId: string | null;
}

export async function createContext({ req }: { req: Request }): Promise<Context> {
  const token = extractToken(req);
  const userId = await verifyTokenAndGetUserId(token);
  return { prisma, userId };
}