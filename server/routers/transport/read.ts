import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const transportReadRouter = router({
  getByStackId: protectedProcedure
    .input(
      z.object({
        stackId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const transport = await ctx.prisma.transport.findFirst({
        where: {
          stackId: input.stackId,
          stack: {
            userId: ctx.userId,
          },
        },
      });

      if (!transport) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transport not found or you don't have access to this stack",
        });
      }

      return transport;
    }),
});
