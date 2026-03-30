import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const screenReadRouter = router({
  getByStackId: protectedProcedure
    .input(
      z.object({
        stackId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const screen = await ctx.prisma.screen.findFirst({
        where: {
          stackId: input.stackId,
          stack: {
            userId: ctx.userId,
          },
        },
      });

      if (!screen) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transport not found or you don't have access to this stack",
        });
      }

      return screen;
    }),
});
