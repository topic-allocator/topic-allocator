import { createRouter } from './trpc';
import { topicRouter } from './routes/topic';
import { instructorRouter } from './routes/instructor';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const router = createRouter({
  topic: topicRouter,
  instructor: instructorRouter,
});

export type Router = typeof router;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
