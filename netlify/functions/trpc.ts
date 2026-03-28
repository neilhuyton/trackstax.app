// netlify/functions/trpc.ts
import "dotenv/config";

console.log("=== ENV VARS IN FUNCTION ===");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "PRESENT" : "MISSING");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "PRESENT" : "MISSING");

import { appRouter } from "../../server/trpc";
import { createContext } from "../../server/context";
import { createNetlifyTrpcHandler } from "@steel-cut/trpc-shared/server";

const corsConfig = {
  allowedOrigins: (process.env.VITE_APP_URL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

export default createNetlifyTrpcHandler({
  router: appRouter,
  createContext: ({ req }) => createContext({ req }),
  corsConfig,
});
