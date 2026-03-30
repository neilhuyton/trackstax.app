import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

const durationSchema = z.object({
  id: z.string().optional(),
  start: z.number().int().min(0),
  stop: z.number().int().min(1),
});

export const trackDurationsRouter = router({
  updateDurations: protectedProcedure
    .input(
      z.object({
        trackId: z.string().min(1),
        durations: z.array(durationSchema),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { trackId, durations } = input;

      const result = await ctx.prisma.$transaction(async (tx) => {
        // Delete old durations
        await tx.duration.deleteMany({ where: { trackId } });

        // Insert new ones
        if (durations.length > 0) {
          await tx.duration.createMany({
            data: durations.map((d) => ({
              id: d.id || crypto.randomUUID(),
              start: d.start,
              stop: d.stop,
              trackId,
            })),
          });
        }

        // Return the fresh track
        return tx.track.findUnique({
          where: { id: trackId },
          include: {
            durations: {
              omit: { trackId: true },
              orderBy: { start: "asc" },
            },
            audioTrack: {
              omit: { trackId: true },
            },
          },
        });
      });

      return result;
    }),
});
