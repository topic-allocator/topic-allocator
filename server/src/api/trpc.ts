import { initTRPC } from '@trpc/server';
import { TRPCContext } from './context';

const t = initTRPC.context<TRPCContext>().create({});

export const createRouter = t.router;
export const createMiddleware = t.middleware;

import { sessionMiddleware } from './middlewares/session';
import { instructorMiddleware } from './middlewares/instructor';
export const protectedProcedure = t.procedure.use(sessionMiddleware);
export const instructorProcedure = t.procedure.use(instructorMiddleware);
