import { protectedProcedure } from "../../trpc-base";
import { z } from "zod";
import type { SamplerEvent } from "@/types";

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
        console.warn("No samplerTrack found for trackId:", input.trackId);
        return { success: false };
      }

      const updated = await ctx.prisma.samplerTrack.update({
        where: { id: samplerTrack.id },
        data: {
          pattern: input.pattern,
        },
      });

      const savedPattern = updated.pattern as SamplerEvent[];
      return {
        success: true,
        savedLength: savedPattern.length,
      };
    }),
};
