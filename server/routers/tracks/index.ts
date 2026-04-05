import { router } from "@steel-cut/trpc-shared/server";

import { trackReadRouter } from "./read";
import { trackCreateRouter } from "./create";
import { trackDeleteRouter } from "./delete";
import { trackUpdateRouter } from "./update";
import { trackDurationsRouter } from "./updateDurations";

export const trackRouter = router({
  getByStackId: trackReadRouter.getByStackId,
  create: trackCreateRouter.create,
  delete: trackDeleteRouter.delete,
  update: trackUpdateRouter.update,
  updateDurations: trackDurationsRouter.updateDurations,
});

export type TrackRouter = typeof trackRouter;
