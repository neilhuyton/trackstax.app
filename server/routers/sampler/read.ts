import { protectedProcedure, router } from "../../trpc-base";
import { z } from "zod";
import type { SamplerPattern } from "@/types";

export const samplerReadRouter = router({
  getByStackId: protectedProcedure
    .input(z.object({ stackId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const samplerTrack = await ctx.prisma.samplerTrack.findFirst({
        where: {
          track: {
            stackId: input.stackId,
            type: "sampler",
          },
        },
        select: {
          pattern: true,
        },
      });

      return {
        pattern: (samplerTrack?.pattern as SamplerPattern) ?? [],
      };
    }),
});
