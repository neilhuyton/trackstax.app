import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

export const trackReadRouter = router({
  getByStackId: protectedProcedure
    .input(z.object({ stackId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const tracks = await ctx.prisma.track.findMany({
        where: {
          stackId: input.stackId,
          stack: {
            userId: ctx.userId,
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          durations: {
            omit: { trackId: true },
            orderBy: { start: "asc" },
          },
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

      return tracks;
    }),
});
