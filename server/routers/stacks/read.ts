import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const stackReadRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.stack.findMany({
      where: { userId: ctx.userId },
      orderBy: { sortOrder: "asc" },
      include: {
        transport: true,
        destination: true,
        tracks: {
          orderBy: { sortOrder: "asc" },
          include: {
            audioTrack: true,
            durations: true,
          },
        },
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const stack = await ctx.prisma.stack.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
        include: {
          transport: true,
          destination: true,
          tracks: {
            orderBy: { sortOrder: "asc" },
            include: {
              audioTrack: true,
              durations: true,
            },
          },
        },
      });

      if (!stack) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stack not found or not owned by you",
        });
      }

      return stack;
    }),
});
