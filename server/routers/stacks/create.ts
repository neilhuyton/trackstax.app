import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

export const stackCreateRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const lastStack = await ctx.prisma.stack.findFirst({
        where: { userId: ctx.userId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });

      const newSortOrder = (lastStack?.sortOrder ?? 0) + 1;

      return ctx.prisma.stack.create({
        data: {
          id: crypto.randomUUID(),
          title: input.title,
          sortOrder: newSortOrder,
          userId: ctx.userId,
        },
        include: {
          transport: true,
          screen: true,
          destination: true,
        },
      });
    }),
});
