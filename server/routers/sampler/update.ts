import type { SamplerEvent, SamplerZone } from "@/types";
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
        zones: z.array(
          z.object({
            id: z.string(),
            sampleUrl: z.string(),
            lowNote: z.string(),
            highNote: z.string(),
            rootNote: z.string(),
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
        data: {
          zones: input.zones,
        },
        select: {
          zones: true,
        },
      });

      return {
        success: true,
        zones: updated.zones as SamplerZone[],
      };
    }),
};
