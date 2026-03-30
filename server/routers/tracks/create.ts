import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

export const trackCreateRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        stackId: z.string().min(1),
        type: z.enum(["audio", "midi"]),
        label: z.string().min(1).max(100),
        color: z.string().min(1).max(50),
        downloadUrl: z.string().url().optional(),
        duration: z.number().optional(),
        fullDuration: z.number().optional(),
        loopLength: z.number().int().min(1).optional(),
        offset: z.number().optional(),
        pitch: z.number().optional(),
        timestretch: z.number().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const lastTrack = await ctx.prisma.track.findFirst({
        where: { stackId: input.stackId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });

      const newSortOrder = (lastTrack?.sortOrder ?? 0) + 1;

      const newTrack = await ctx.prisma.track.create({
        data: {
          id: crypto.randomUUID(),
          type: input.type,
          label: input.label,
          color: input.color,
          sortOrder: input.sortOrder ?? newSortOrder,
          stackId: input.stackId,

          isMute: false,
          isSolo: false,
          isFavourite: false,
          volumePercent: 100,
          low: 0,
          mid: 0,
          high: 0,
          lowFrequency: 0,
          highFrequency: 0,
          isBypass: false,

          audioTrack:
            input.type === "audio"
              ? {
                  create: {
                    id: crypto.randomUUID(),
                    filename: input.label,
                    downloadUrl: input.downloadUrl || "",
                    loopLength: input.loopLength ?? 4,
                    offset: input.offset ?? 0,
                    duration: input.duration ?? 0,
                    pitch: input.pitch ?? 0,
                    timestretch: input.timestretch ?? 1,
                    fullDuration: input.fullDuration ?? input.duration ?? 0,
                  },
                }
              : undefined,

          durations: {
            create: [
              {
                id: crypto.randomUUID(),
                start: 0,
                stop: input.loopLength ?? 4,
              },
            ],
          },
        },
        include: {
          durations: true,
          audioTrack: true,
        },
      });

      return newTrack;
    }),
});
