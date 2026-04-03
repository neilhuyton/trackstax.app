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
        console.warn("No sampler track found for trackId", input.trackId);
        return { success: false };
      }

      await ctx.prisma.samplerTrack.update({
        where: { id: samplerTrack.id },
        data: { pattern: input.pattern },
      });

      return { success: true };
    }),
};
