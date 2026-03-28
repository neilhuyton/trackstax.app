console.log("=== FUNCTION STARTED AT", new Date().toISOString());
console.log("DATABASE_URL present?", !!process.env.DATABASE_URL);
console.log("SUPABASE_URL present?", !!process.env.SUPABASE_URL);
console.log(
  "All env keys:",
  Object.keys(process.env).filter(
    (k) => k.includes("SUPABASE") || k.includes("DATABASE"),
  ),
);

import type { AnyRouter } from "@trpc/server";
// import { appRouter } from "../../server/trpc";
// import { createContext } from "../../server/context";
import { createNetlifyTrpcHandler } from "@steel-cut/trpc-shared/server";

// const corsConfig = {
//   allowedOrigins: (process.env.VITE_APP_URL || "")
//     .split(",")
//     .map((s) => s.trim())
//     .filter(Boolean),
// };

const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
  MY_API_KEY: process.env.MY_API_KEY,   // your missing one
  // add any others you need
};

console.log("=== FUNCTION STARTED AT::", new Date().toISOString());
console.log("DATABASE_URL present?", !!process.env.DATABASE_URL);
console.log("SUPABASE_URL present?", !!process.env.SUPABASE_URL);
console.log(
  "All env keys:",
  Object.keys(process.env).filter(
    (k) => k.includes("SUPABASE") || k.includes("DATABASE"),
  ),
);

export default createNetlifyTrpcHandler({
  router: undefined as unknown as AnyRouter,
  createContext: () => ({ env }),   // pass env down
  corsConfig: { allowedOrigins: [] },
});
