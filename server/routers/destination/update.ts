import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

export const destinationUpdateRouter = router({
  update: protectedProcedure
    .input(
      z.object({
        stackId: z.string().min(1),
        volumePercent: z.number().int().min(0).max(100).optional(),
        isMute: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updatedDestination = await ctx.prisma.destination.upsert({
        where: {
          stackId: input.stackId,
        },
        update: {
          volumePercent: input.volumePercent,
          isMute: input.isMute,
        },
        create: {
          id: crypto.randomUUID(),
          stackId: input.stackId,
          volumePercent: input.volumePercent ?? 100,
          isMute: input.isMute ?? false,
        },
      });

      return updatedDestination;
    }),
});
