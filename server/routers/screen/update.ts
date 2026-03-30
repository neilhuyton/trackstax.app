import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

export const screenUpdateRouter = router({
  update: protectedProcedure
    .input(
      z.object({
        stackId: z.string().min(1),
        gridLengthInBars: z.number().int().min(1).max(300),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updated = await ctx.prisma.screen.update({
        where: {
          stackId: input.stackId,
          stack: { userId: ctx.userId },
        },
        data: {
          gridLengthInBars: input.gridLengthInBars,
        },
      });

      return updated;
    }),
});
