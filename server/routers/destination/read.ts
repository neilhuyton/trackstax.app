import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

export const destinationReadRouter = router({
  getByStackId: protectedProcedure
    .input(z.object({ stackId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const destination = await ctx.prisma.destination.findUnique({
        where: {
          stackId: input.stackId,
          stack: {
            userId: ctx.userId,
          },
        },
      });

      return destination;
    }),
});
