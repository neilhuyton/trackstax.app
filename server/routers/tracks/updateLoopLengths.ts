import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

const loopLengthSchema = z.object({
  id: z.string().min(1),
  loopLength: z.number().int().min(1),
});

export const trackLoopLengthRouter = router({
  updateMany: protectedProcedure
    .input(z.array(loopLengthSchema))
    .mutation(async ({ input, ctx }) => {
      const updates = input.map((update) =>
        ctx.prisma.audioTrack.update({
          where: { trackId: update.id },
          data: { loopLength: update.loopLength },
        }),
      );

      await ctx.prisma.$transaction(updates);

      return { success: true };
    }),
});
