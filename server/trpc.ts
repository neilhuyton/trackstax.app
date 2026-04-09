import { router, createCallerFactory } from "@steel-cut/trpc-shared/server";
import { userRouter, healthRouter } from "@steel-cut/trpc-shared/server";
import { stackRouter } from "./routers/stacks";
import { transportRouter } from "./routers/transport";
import { trackRouter } from "./routers/tracks";
import { sampleRouter } from "./routers/samples";
import { samplerRouter } from "./routers/sampler";
import { destinationRouter } from "./routers/destination";

export const appRouter = router({
  user: userRouter,
  health: healthRouter,
  stack: stackRouter,
  transport: transportRouter,
  track: trackRouter,
  sample: sampleRouter,
  sampler: samplerRouter,
  destination: destinationRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
