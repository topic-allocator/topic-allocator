import { TRPCError } from '@trpc/server';
import { getLabel } from '../../labels';
import { sessionMiddleware } from './session';
import { procedure } from '../trpc';

export const adminMiddleware = sessionMiddleware.unstable_pipe(
  ({ ctx, next }) => {
    if (!ctx.session.isAdmin) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: getLabel('UNAUTHORIZED_REQUEST', ctx.locale),
      });
    }

    return next();
  },
);

export const adminProcedure = procedure.use(adminMiddleware);
