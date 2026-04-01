import { router } from "@steel-cut/trpc-shared/server";

import { sampleReadRouter } from "./read";

export const sampleRouter = router({
  getCollections: sampleReadRouter.getCollections,
  getSubcategories: sampleReadRouter.getSubcategories,
  getSamples: sampleReadRouter.getSamples,
  getAvailableBpms: sampleReadRouter.getAvailableBpms,
});

export type SampletRouter = typeof sampleRouter;
