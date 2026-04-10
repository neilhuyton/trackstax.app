import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

const trackInclude = {
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
} as const;

export const trackUpdateRouter = router({
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1).max(100).optional(),
        isMute: z.boolean().optional(),
        isSolo: z.boolean().optional(),
        isFavourite: z.boolean().optional(),
        volumePercent: z.number().int().min(0).max(100).optional(),
        low: z.number().optional(),
        mid: z.number().optional(),
        high: z.number().optional(),
        lowFrequency: z.number().optional(),
        highFrequency: z.number().optional(),
        isBypass: z.boolean().optional(),
        loopLength: z.number().int().min(1).max(8).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updatedTrack = await ctx.prisma.track.update({
        where: {
          id: input.id,
        },
        data: {
          label: input.label,
          isMute: input.isMute,
          isSolo: input.isSolo,
          isFavourite: input.isFavourite,
          volumePercent: input.volumePercent,
          low: input.low,
          mid: input.mid,
          high: input.high,
          lowFrequency: input.lowFrequency,
          highFrequency: input.highFrequency,
          isBypass: input.isBypass,
          loopLength: input.loopLength,
        },
        include: trackInclude,
      });

      return updatedTrack;
    }),
});
