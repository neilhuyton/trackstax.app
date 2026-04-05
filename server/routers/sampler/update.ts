import type { SamplerEvent } from "@/types";
import { protectedProcedure } from "../../trpc-base";
import { z } from "zod";

export const samplerUpdateRouter = {
  updatePattern: protectedProcedure
    .input(
      z.object({
        trackId: z.string().uuid(),
        pattern: z.array(
          z.object({
            time: z.string(),
            note: z.string(),
            duration: z.string().optional().default("16n"),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const samplerTrack = await ctx.prisma.samplerTrack.findUnique({
        where: { trackId: input.trackId },
      });

      if (!samplerTrack) {
        throw new Error("Sampler track not found");
      }

      const updated = await ctx.prisma.samplerTrack.update({
        where: { id: samplerTrack.id },
        data: { pattern: input.pattern },
      });

      return {
        success: true,
        pattern: updated.pattern as SamplerEvent[],
      };
    }),

  updateSample: protectedProcedure
    .input(
      z.object({
        trackId: z.string().uuid(),
        sampleUrl: z
          .string()
          .refine(
            (val) =>
              val.startsWith("/") || z.string().url().safeParse(val).success,
            { message: "Must be a valid URL or path starting with /" },
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const samplerTrack = await ctx.prisma.samplerTrack.findUnique({
        where: { trackId: input.trackId },
      });

      if (!samplerTrack) {
        throw new Error("Sampler track not found");
      }

      const updated = await ctx.prisma.samplerTrack.update({
        where: { id: samplerTrack.id },
        data: {
          sampleUrl: input.sampleUrl,
        },
        select: {
          sampleUrl: true,
        },
      });

      return {
        success: true,
        sampleUrl: updated.sampleUrl,
      };
    }),
};
