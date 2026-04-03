import { router } from "@steel-cut/trpc-shared/server";

import { samplerReadRouter } from "./read";

export const samplerRouter = router({
  getByStackId: samplerReadRouter.getByStackId,
});

export type SampleRRouter = typeof samplerRouter;
