import { createRouter } from './trpc';
import { topicRouter } from './routes/topic';
import { instructorRouter } from './routes/instructor';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { protectedProcedure } from './middlewares/session';
import { studentRouter } from './routes/student';
import { courseRouter } from './routes/course';
import { solverRouter } from './routes/solver';

export const router = createRouter({
  topic: topicRouter,
  instructor: instructorRouter,
  student: studentRouter,
  course: courseRouter,
  solver: solverRouter,
  session: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),
});

export type Router = typeof router;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
