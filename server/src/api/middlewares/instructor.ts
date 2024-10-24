import { TRPCError } from '@trpc/server';
import { getLabel } from '../../labels';
import { sessionMiddleware } from './session';
import { procedure } from '../trpc';

export const instructorMiddleware = sessionMiddleware.unstable_pipe(
  ({ ctx, next }) => {
    if (!ctx.session.isInstructor) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: getLabel('UNAUTHORIZED_REQUEST', ctx.locale),
      });
    }

    return next();
  },
);

export const instructorProcedure = procedure.use(instructorMiddleware);
