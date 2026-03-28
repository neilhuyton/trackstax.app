console.log("=== FUNCTION STARTED AT", new Date().toISOString());
console.log("DATABASE_URL present?", !!process.env.DATABASE_URL);
console.log("SUPABASE_URL present?", !!process.env.SUPABASE_URL);
console.log("All env keys:", Object.keys(process.env).filter(k => k.includes("SUPABASE") || k.includes("DATABASE")));

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