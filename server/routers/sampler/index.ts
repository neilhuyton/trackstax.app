import { router } from "@steel-cut/trpc-shared/server";
import { samplerReadRouter } from "./read";
import { samplerUpdateRouter } from "./update";
import { samplerUpdateEnvelopeRouter } from "./updateEnvelope";

export const samplerRouter = router({
  getByTrackId: samplerReadRouter.getByTrackId,
  updatePattern: samplerUpdateRouter.updatePattern,
  updateSample: samplerUpdateRouter.updateSample,
  updateEnvelope: samplerUpdateEnvelopeRouter.updateEnvelope,
});

export type SamplerRouter = typeof samplerRouter;