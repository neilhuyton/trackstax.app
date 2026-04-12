import type { SamplerPattern, SamplerZone } from "@/types";
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
          // sampleUrl: true,
          attackMs: true,
          releaseMs: true,
          zones: true,
        },
      });

      return {
        pattern: (samplerTrack?.pattern as SamplerPattern) ?? [],
        // sampleUrl: samplerTrack?.sampleUrl ?? null,
        attackMs: samplerTrack?.attackMs ?? 10,
        releaseMs: samplerTrack?.releaseMs ?? 200,
        zones: (samplerTrack?.zones as SamplerZone[]) ?? [],
      };
    }),
});
