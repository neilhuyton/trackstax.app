import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const sampleReadRouter = router({
  getCollections: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.collection.findMany({
      select: {
        name: true,
        slug: true,
        coverImage: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });
  }),

  getSubcategories: protectedProcedure
    .input(z.object({ collection: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const subcats = await ctx.prisma.sample.findMany({
        where: {
          collectionName: input.collection,
        },
        select: { subcategory: true },
        distinct: ["subcategory"],
        orderBy: { subcategory: "asc" },
      });

      return subcats
        .map((s) => s.subcategory)
        .filter((sub): sub is string => Boolean(sub));
    }),

  getSamples: protectedProcedure
    .input(
      z.object({
        collection: z.string().min(1),
        subcategory: z.string().nullable(),
        bpm: z.number().int().positive().nullable().optional(),
        search: z.string().trim().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.SampleWhereInput = {
        collectionName: input.collection,
      };

      if (input.subcategory !== null) {
        where.subcategory = input.subcategory;
      }

      if (input.bpm !== null && input.bpm !== undefined) {
        where.bpm = input.bpm;
      }

      if (input.search) {
        where.filename = {
          contains: input.search,
          mode: "insensitive",
        };
      }

      return ctx.prisma.sample.findMany({
        where,
        orderBy: [{ bpm: "asc" }, { key: "asc" }, { filename: "asc" }],
      });
    }),

  getAvailableBpms: protectedProcedure
    .input(
      z.object({
        collection: z.string().min(1),
        subcategory: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.prisma.sample.findMany({
        where: {
          collectionName: input.collection,
          subcategory: input.subcategory ?? undefined,
          bpm: { not: null },
        },
        select: {
          bpm: true,
        },
        distinct: ["bpm"],
        orderBy: { bpm: "asc" },
      });

      return result
        .map((s) => s.bpm)
        .filter((bpm): bpm is number => bpm != null);
    }),
});
