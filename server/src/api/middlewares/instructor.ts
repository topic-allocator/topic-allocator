import { sessionMiddleware } from './session';

export const instructorMiddleware = sessionMiddleware.unstable_pipe(
  ({ ctx, next }) => {
    if (!ctx.session.isInstructor) {
      throw new Error('Procedure can only be called by instructors.');
    }

    return next();
  },
);
