import { router } from "@steel-cut/trpc-shared/server";
import { samplerReadRouter } from "./read";
import { samplerUpdateRouter } from "./update";

export const samplerRouter = router({
  getByTrackId: samplerReadRouter.getByTrackId,
  updatePattern: samplerUpdateRouter.updatePattern,
  updateSample: samplerUpdateRouter.updateSample,
});

export type SamplerRouter = typeof samplerRouter;
