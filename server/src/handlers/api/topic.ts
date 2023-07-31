import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { Topic } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../db';
import { Session } from '../../utils';

export type GetTopicsResponse = (Topic & {
  instructor: {
    name: string;
  };
  isAddedToPreferences?: boolean;
})[];
export async function getTopics(
  _: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  try {
    let topics = await prisma.topic.findMany({
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
      },
    });

    if (session.isStudent) {
      const topicPreferences = await prisma.studentTopicPreference.findMany({
        where: {
          studentId: session.userId,
        },
      });

      topics = topics.map((topic) => ({
        ...topic,
        isAddedToPreferences: topicPreferences.some(
          (preference) => preference.topicId === topic.id,
        ),
      }));
    }

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
    context.warn('createTopic can only be called by admins or instructors');

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
        status: 422,
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

    const instructor = await prisma.instructor.findUnique({
      where: {
        id: session.userId,
      },
    });
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

const updateTopicInput = newTopicInput
  .partial()
  .merge(z.object({ id: z.number() }));
export type UpdateTopicInput = z.infer<typeof updateTopicInput>;

export async function deleteTopic(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isAdmin && !session.isInstructor) {
    context.warn('deleteTopic can only be called by admins or instructors');

    return {
      status: 401,
      jsonBody: {
        message: 'UNAUTHORIZED_REQUEST',
      },
    };
  }

  const topicId = request.params.topicId;
  if (!topicId) {
    context.warn('no topicId provided');

    return {
      status: 400,
      jsonBody: {
        message: 'INVALID_REQUEST',
      },
    };
  }
  const userId = session.userId;

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
      context.warn('a topic can only be deleted by its creator');

      return {
        status: 401,
        jsonBody: {
          message: 'UNAUTHORIZED_REQUEST',
        },
      };
    }

    await prisma.studentTopicPreference.deleteMany({
      where: {
        topicId: parseInt(topicId),
      },
    });
    await prisma.topicCoursePreference.deleteMany({
      where: {
        topicId: parseInt(topicId),
      },
    });

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
