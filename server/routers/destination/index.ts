import { router } from "@steel-cut/trpc-shared/server";

import { destinationReadRouter } from "./read";
import { destinationUpdateRouter } from "./update";

export const destinationRouter = router({
  getByStackId: destinationReadRouter.getByStackId,
  update: destinationUpdateRouter.update,
});

export type DestinationRouter = typeof destinationRouter;
