import { router } from "@steel-cut/trpc-shared/server";

import { transportReadRouter } from "./read";
import { transportUpdateRouter } from "./update";

export const transportRouter = router({
  getByStackId: transportReadRouter.getByStackId,
  update: transportUpdateRouter.update,
});

export type TransportRouter = typeof transportRouter;
