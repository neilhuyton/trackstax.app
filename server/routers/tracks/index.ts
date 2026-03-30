import { router } from "@steel-cut/trpc-shared/server";

import { trackReadRouter } from "./read";
import { trackCreateRouter } from "./create";
import { trackDeleteRouter } from "./delete";
import { trackUpdateRouter } from "./update";
import { trackLoopLengthRouter } from "./updateLoopLengths";

export const trackRouter = router({
  getByStackId: trackReadRouter.getByStackId,
  create: trackCreateRouter.create,
  delete: trackDeleteRouter.delete,
  update: trackUpdateRouter.update,
  updateLoopLengths: trackLoopLengthRouter.updateMany,
});

export type TrackRouter = typeof trackRouter;
