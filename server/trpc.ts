import { router, createCallerFactory } from "@steel-cut/trpc-shared/server";
import { userRouter, healthRouter } from "@steel-cut/trpc-shared/server";
import { stackRouter } from "./routers/stacks";
import { transportRouter } from "./routers/transport";
import { screenRouter } from "./routers/screen";
import { trackRouter } from "./routers/tracks";

export const appRouter = router({
  user: userRouter,
  health: healthRouter,
  stack: stackRouter,
  transport: transportRouter,
  screen: screenRouter,
  track: trackRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
