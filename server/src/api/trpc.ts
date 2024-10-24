import { initTRPC } from '@trpc/server';
import { TRPCContext } from './context';
import superjson from 'superjson';

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const createMiddleware = t.middleware;
export const procedure = t.procedure;
