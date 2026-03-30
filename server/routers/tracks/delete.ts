import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

export const trackDeleteRouter = router({
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.track.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
