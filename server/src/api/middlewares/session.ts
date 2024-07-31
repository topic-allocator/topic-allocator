import { TRPCError } from '@trpc/server';
import { getLabel } from '../../labels';
import { createMiddleware } from '../trpc';

export const sessionMiddleware = createMiddleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: getLabel('UNAUTHORIZED_REQUEST', ctx.locale),
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});
