import { appRouter } from "../../server/trpc";
import { createContext } from "../../server/context";
import { createNetlifyTrpcHandler } from "@steel-cut/trpc-shared/server";

console.log("process.env", process.env);

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
