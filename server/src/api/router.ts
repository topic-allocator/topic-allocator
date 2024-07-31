import { createRouter } from './trpc';
import { topicRouter } from './routes/topic';
import { instructorRouter } from './routes/instructor';

export const router = createRouter({
  topic: topicRouter,
  instructor: instructorRouter,
});

export type Router = typeof router;
