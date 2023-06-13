import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { Topic } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../db';
import { checkForExistingUser, Session } from '../../utils';

export type GetTopicsResponse = (Topic & {
  instructor: {
    name: string;
  };
})[];
export async function getTopics(
  _: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      jsonBody: [...topics] satisfies GetTopicsResponse,
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
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isAdmin && !session.isInstructor) {
    context.warn('Unauthorized request');

    return {
      status: 401,
      jsonBody: {
        message: 'UNAUTHORIZED_REQUEST',
      },
    };
  }

  try {
    const newTopicData = await request.json();

    const parsed = newTopicInput.safeParse(newTopicData);

    if (!parsed.success) {
      context.warn('Invalid request body');

      return {
        status: 400,
        jsonBody: {
          message: 'INVALID_REQUEST_BODY',
        },
      };
    }

    const topicWithSameTitle = await prisma.topic.findFirst({
      where: {
        title: parsed.data.title,
      },
    });
    if (topicWithSameTitle) {
      return {
        status: 409,
        jsonBody: {
          message: 'TOPIC_ALREADY_EXISTS',
        },
      };
    }

    const instructor = await checkForExistingUser(session);
    if (!instructor) {
      context.warn('Instructor not found');

      return {
        status: 404,
        jsonBody: {
          message: 'USER_NOT_FOUND',
        },
      };
    }

    const topic = await prisma.topic.create({
      data: {
        ...parsed.data,
        instructorId: instructor.id,
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
      status: 500,
    };
  }
}

export const newTopicInput = z.object({
  title: z.string(),
  description: z.string().max(500).nonempty(),
  capacity: z.number().min(1),
  type: z.enum(['normal', 'tdk', 'research', 'internship']),
});

export async function updateTopic(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const topicData = await request.json();
  const parsed = updateTopicInput.safeParse(topicData);

  if (!parsed.success) {
    context.warn('Invalid request body');

    return {
      status: 400,
      jsonBody: {
        message: 'INVALID_REQUEST_BODY',
      },
    };
  }

  try {
    const topic = await prisma.topic.update({
      where: {
        id: parsed.data.id,
      },
      data: { ...parsed.data, id: undefined },
    });

    return {
      jsonBody: {
        ...topic,
      },
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

const updateTopicInput = newTopicInput.partial().merge(z.object({ id: z.number() }));
export type UpdateTopicInput = z.infer<typeof updateTopicInput>;

export async function deleteTopic(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isAdmin && !session.isInstructor) {
    context.warn('Unauthorized request');

    return {
      status: 401,
      jsonBody: {
        message: 'UNAUTHORIZED_REQUEST',
      },
    };
  }

  const topicId = request.params.topicId;
  if (!topicId) {
    context.warn('Invalid request');

    return {
      status: 400,
      jsonBody: {
        message: 'INVALID_REQUEST',
      },
    };
  }
  const userId = session.userId;

  console.log('topicId', topicId);

  try {
    const topic = await prisma.topic.findUnique({
      where: {
        id: parseInt(topicId),
      },
    });

    if (!topic) {
      context.warn('Topic not found');

      return {
        status: 404,
        jsonBody: {
          message: 'TOPIC_NOT_FOUND',
        },
      };
    }

    if (topic.instructorId !== userId) {
      context.warn('Unauthorized request');

      return {
        status: 401,
        jsonBody: {
          message: 'UNAUTHORIZED_REQUEST',
        },
      };
    }

    const deletedTopic = await prisma.topic.delete({
      where: {
        id: parseInt(topicId),
      },
    });

    return {
      status: 202,
      jsonBody: {
        ...deletedTopic,
      },
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
