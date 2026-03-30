import { router } from "@steel-cut/trpc-shared/server";

import { screenReadRouter } from "./read";
import { screenUpdateRouter } from "./update";

export const screenRouter = router({
  getByStackId: screenReadRouter.getByStackId,
  update: screenUpdateRouter.update,
});

export type TransportRouter = typeof screenRouter;
