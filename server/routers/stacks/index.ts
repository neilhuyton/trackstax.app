import { router } from "@steel-cut/trpc-shared/server";

import { stackReadRouter } from "./read";
import { stackCreateRouter } from "./create";
import { stackDeleteRouter } from "./delete";
import { stackUpdateRouter } from "./update";

export const stackRouter = router({
  getAll: stackReadRouter.getAll,
  getById: stackReadRouter.getById,
  create: stackCreateRouter.create,
  delete: stackDeleteRouter.delete,
  update: stackUpdateRouter.update,
});

export type StackRouter = typeof stackRouter;
