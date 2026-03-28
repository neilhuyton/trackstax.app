import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const stackDeleteRouter = router({
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const stack = await ctx.prisma.stack.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (!stack) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stack not found or not owned by you",
        });
      }

      await ctx.prisma.stack.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
