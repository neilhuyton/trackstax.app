import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

export const trackDurationsRouter = router({
  updateDurations: protectedProcedure
    .input(
      z.object({
        trackId: z.string().min(1),
        durations: z.array(
          z.object({
            id: z.string().optional(),
            start: z.number().int().min(0),
            stop: z.number().int().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.prisma.track.update({
        where: { id: input.trackId },
        data: {
          durations: input.durations,
        },
        include: {
          audioTrack: {
            omit: { trackId: true },
          },
          samplerTrack: {
            select: {
              pattern: true,
              sampleUrl: true,
              attackMs: true,
              releaseMs: true,
            },
          },
        },
      });

      return result;
    }),
});
