import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { Student, Topic } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../db';
import { Session } from '../../lib/utils';
import { getLabel } from '../../labels';

export type GetTopicsOutput = (Topic & {
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
        _count: {
          select: {
            assignedStudents: true,
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

      topics = topics
        .filter((topic) => topic._count.assignedStudents < topic.capacity)
        .map((topic) => ({
          ...topic,
          isAddedToPreferences: topicPreferences.some(
            (preference) => preference.topicId === topic.id,
          ),
        }));
    }

    return {
      jsonBody: topics satisfies GetTopicsOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export const createTopicInput = z.object({
  title: z.string(),
  description: z.string().max(500).min(1),
  capacity: z.number().min(1),
  type: z.enum(['normal', 'tdk', 'research', 'internship']),
});
export type CreateTopicInput = z.infer<typeof createTopicInput>;
export type CreateTopicOutput = Topic;

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
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  try {
    const newTopicData = await request.json();

    const parsed = createTopicInput.safeParse(newTopicData);

    if (!parsed.success) {
      context.warn('Invalid request body');

      return {
        status: 422,
        jsonBody: {
          message: getLabel('UNPROCESSABLE_ENTITY', request),
          error: parsed.error,
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
          message: getLabel('TOPIC_ALREADY_EXISTS', request),
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
          message: getLabel('USER_NOT_FOUND', request),
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
      jsonBody: topic satisfies CreateTopicOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

const updateTopicInput = createTopicInput
  .partial()
  .merge(z.object({ id: z.string() }));
export type UpdateTopicInput = z.infer<typeof updateTopicInput>;
export type UpdateTopicOutput = Topic;

export async function updateTopic(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  const topicData = await request.json();
  const parsed = updateTopicInput.safeParse(topicData);

  if (!parsed.success) {
    context.warn('Invalid request body');

    return {
      status: 422,
      jsonBody: {
        message: getLabel('UNPROCESSABLE_ENTITY', request),
        error: parsed.error,
      },
    };
  }

  try {
    const assignedStudents = await prisma.student.aggregate({
      _count: true,
      where: {
        assignedTopicId: parsed.data.id,
      },
    });

    if (
      parsed.data.capacity &&
      assignedStudents._count > parsed.data.capacity
    ) {
      context.warn(
        `The new capacity (${parsed.data.capacity}) of the topic is less than the number of assigned students (${assignedStudents._count})`,
      );

      return {
        status: 400,
        jsonBody: {
          message: getLabel('CAPACITY_CAN_NOT_BE_LOWER_THAN', request).replace(
            '${}',
            assignedStudents._count.toString(),
          ),
        },
      };
    }

    const topicToBeUpdated = await prisma.topic.findUnique({
      where: {
        id: parsed.data.id,
      },
    });

    if (!topicToBeUpdated) {
      context.warn('Topic not found');

      return {
        status: 404,
        jsonBody: {
          message: getLabel('TOPIC_NOT_FOUND', request),
        },
      };
    }

    if (topicToBeUpdated.instructorId !== session.userId) {
      context.warn('a topic can only be updated by its creator');

      return {
        status: 401,
        jsonBody: {
          message: getLabel('UNAUTHORIZED_REQUEST', request),
        },
      };
    }

    const topic = await prisma.topic.update({
      where: {
        id: parsed.data.id,
      },
      data: { ...parsed.data, id: undefined },
    });

    return {
      jsonBody: topic satisfies UpdateTopicOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export type DeleteTopicOutput = Topic;
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
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  const topicId = request.params.topicId;
  if (!topicId) {
    context.warn('no topicId provided');

    return {
      status: 422,
      jsonBody: {
        message: getLabel('UNPROCESSABLE_ENTITY', request),
        error: 'no topicId provided',
      },
    };
  }
  const userId = session.userId;

  try {
    const topic = await prisma.topic.findUnique({
      where: {
        id: topicId,
      },
    });

    if (!topic) {
      context.warn('Topic not found');

      return {
        status: 404,
        jsonBody: {
          message: getLabel('TOPIC_NOT_FOUND', request),
        },
      };
    }

    if (topic.instructorId !== userId) {
      context.warn('a topic can only be deleted by its creator');

      return {
        status: 401,
        jsonBody: {
          message: getLabel('UNAUTHORIZED_REQUEST', request),
        },
      };
    }

    await prisma.studentTopicPreference.deleteMany({
      where: {
        topicId: topicId,
      },
    });
    await prisma.topicCoursePreference.deleteMany({
      where: {
        topicId: topicId,
      },
    });

    const deletedTopic = await prisma.topic.delete({
      where: {
        id: topicId,
      },
    });

    return {
      status: 202,
      jsonBody: deletedTopic satisfies DeleteTopicOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export type GetAssignedStudentsOutput = Student[];
export async function getAssignedStudents(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
) {
  if (!session.isAdmin && !session.isInstructor) {
    context.warn(
      'getAssignedStudents can only be called by admins or instructors',
    );

    return {
      status: 401,
      jsonBody: {
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  const topicId = request.params.topicId;
  if (!topicId) {
    context.warn('no topicId provided');

    return {
      status: 422,
      jsonBody: {
        message: getLabel('UNPROCESSABLE_ENTITY', request),
        error: 'no topicId provided',
      },
    };
  }

  try {
    const students = await prisma.student.findMany({
      where: {
        assignedTopicId: topicId,
      },
    });

    return {
      jsonBody: students satisfies GetAssignedStudentsOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
