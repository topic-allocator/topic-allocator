import { z } from 'zod';
import { createRouter, instructorProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { getLabel } from '../../labels';

export const instructorRouter = createRouter({
  getOne: instructorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const instructor = await ctx.db.instructor.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!instructor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: getLabel('USER_NOT_FOUND', ctx.locale),
        });
      }

      return instructor;
    }),
});
