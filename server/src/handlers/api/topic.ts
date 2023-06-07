import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { prisma } from '../../db';
import { getSession } from '../../utils';

export async function getTopics(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const session = getSession(request);
  if (!session) {
    context.warn('Invalid session');
    return {
      status: 401,
    };
  }

  try {
    const topics = await prisma.topic.findMany();

    return {
      jsonBody: [...topics],
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export async function createTopic(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  // TODO: instructor or admin + validation
  const session = getSession(request);
  if (!session) {
    context.warn('Invalid session');
    return {
      status: 401,
    };
  }

  const newTopicData = await request.json();
  try {
    const topic = await prisma.topic.create({
      data: newTopicData as {
        title: string;
        description: string;
        capacity: number;
        type: string;
        instructorId: number;
      },
    });

    return {
      jsonBody: {
        ...topic,
      },
    };
  } catch (error) {
    context.error(error);

    return {
      status: 300,
    };
  }
}
