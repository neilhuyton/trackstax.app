import { protectedProcedure } from "../../trpc-base";
import { z } from "zod";

export const samplerUpdateEnvelopeRouter = {
  updateEnvelope: protectedProcedure
    .input(
      z.object({
        trackId: z.string().uuid(),
        attackMs: z.number().int().min(0).max(2000),
        releaseMs: z.number().int().min(0).max(3000),
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
          attackMs: input.attackMs,
          releaseMs: input.releaseMs,
        },
        select: {
          attackMs: true,
          releaseMs: true,
        },
      });

      return {
        success: true,
        attackMs: updated.attackMs,
        releaseMs: updated.releaseMs,
      };
    }),
};