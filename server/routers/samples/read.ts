import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";

export const sampleReadRouter = router({
  getCollections: protectedProcedure.query(async ({ ctx }) => {
    const collections = await ctx.prisma.sample.findMany({
      select: { collection: true },
      distinct: ["collection"],
      orderBy: { collection: "asc" },
    });
    return collections.map((c) => c.collection);
  }),

  getSubcategories: protectedProcedure
    .input(z.object({ collection: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const subcats = await ctx.prisma.sample.findMany({
        where: { collection: input.collection },
        select: { subcategory: true },
        distinct: ["subcategory"],
        orderBy: { subcategory: "asc" },
      });
      return subcats.map((s) => s.subcategory).filter(Boolean) as string[];
    }),

  getSamples: protectedProcedure
    .input(
      z.object({
        collection: z.string().min(1),
        subcategory: z.string().nullable(),
        bpm: z.number().int().positive().nullable().optional(),
        search: z.string().trim().optional(), // ← new: text search
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.sample.findMany({
        where: {
          collection: input.collection,
          subcategory: input.subcategory ?? null,
          ...(input.bpm && { bpm: input.bpm }),
          ...(input.search && {
            filename: {
              contains: input.search,
              mode: "insensitive", // case-insensitive search
            },
          }),
        },
        orderBy: { filename: "asc" },
      });
    }),
});
