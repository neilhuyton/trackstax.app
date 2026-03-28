import { router, createCallerFactory } from "@steel-cut/trpc-shared/server";
import { userRouter, healthRouter } from "@steel-cut/trpc-shared/server";
import { stackRouter } from "./routers/stacks";

export const appRouter = router({
  user: userRouter,
  health: healthRouter,
  stack: stackRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
