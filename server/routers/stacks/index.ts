import { router } from "@steel-cut/trpc-shared/server";

import { stackReadRouter } from "./read";
import { stackCreateRouter } from "./create";
import { stackDeleteRouter } from "./delete";

export const stackRouter = router({
  getAll: stackReadRouter.getAll,
  getById: stackReadRouter.getById,
  create: stackCreateRouter.create,
  delete: stackDeleteRouter.delete,
});

export type StackRouter = typeof stackRouter;
