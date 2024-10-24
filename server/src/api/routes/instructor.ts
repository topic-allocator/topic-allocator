import { z } from 'zod';
import { createRouter } from '../trpc';
import { TRPCError } from '@trpc/server';
import { instructorProcedure } from '../middlewares/instructor';
import { protectedProcedure } from '../middlewares/session';
import { adminProcedure } from '../middlewares/admin';

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
          message: ctx.getLabel('USER_NOT_FOUND'),
        });
      }

      return instructor;
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.instructor.findMany();
  }),
  updateMinMax: adminProcedure
    .input(
      z.array(
        z.object({
          id: z.string().min(1),
          min: z.number().min(0).optional(),
          max: z.number().min(0).optional(),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.$transaction(
        input.map(({ id, min, max }) =>
          ctx.db.instructor.update({
            where: { id },
            data: { min, max },
          }),
        ),
      );
    }),
});
