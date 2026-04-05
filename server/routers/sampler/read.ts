import type { SamplerPattern } from "@/types";
import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

export const samplerReadRouter = router({
  getByTrackId: protectedProcedure
    .input(z.object({ trackId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const samplerTrack = await ctx.prisma.samplerTrack.findUnique({
        where: { trackId: input.trackId },
        select: {
          pattern: true,
          sampleUrl: true, // ← also return sampleUrl
        },
      });

      return {
        pattern: (samplerTrack?.pattern as SamplerPattern) ?? [],
        sampleUrl: samplerTrack?.sampleUrl ?? null,
      };
    }),
});
