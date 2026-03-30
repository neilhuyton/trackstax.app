import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

export const stackUpdateRouter = router({
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        title: z.string().min(3).max(50),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updatedStack = await ctx.prisma.stack.update({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
        data: {
          title: input.title,
        },
      });

      return updatedStack;
    }),
});
