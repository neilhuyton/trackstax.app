import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

export const transportUpdateRouter = router({
  update: protectedProcedure
    .input(
      z.object({
        stackId: z.string().min(1),
        tempo: z.number().int().min(20).max(300).optional(),
        isLoop: z.boolean().optional(),
        loopStart: z.number().int().min(0).optional(),
        loopEnd: z.number().int().min(1).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updatedTransport = await ctx.prisma.transport.update({
        where: {
          stackId: input.stackId,
        },
        data: {
          tempo: input.tempo,
          isLoop: input.isLoop,
          loopStart: input.loopStart,
          loopEnd: input.loopEnd,
        },
      });

      return updatedTransport;
    }),
});
