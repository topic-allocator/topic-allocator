import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { Instructor, StudentTopicPreference, Topic } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../db';
import { Session } from '../../lib/utils';
import { getLabel } from '../../labels';

export type GetTopicPreferencesResponse = (StudentTopicPreference & {
  topic: Topic & { instructor: Instructor };
})[];
export async function getTopicPreferences(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isStudent) {
    context.warn('not a student');

    return {
      status: 401,
      jsonBody: {
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  try {
    const preferences = await prisma.studentTopicPreference.findMany({
      where: {
        studentId: session.userId,
      },
      include: {
        topic: {
          include: {
            instructor: true,
          },
        },
      },
      orderBy: {
        rank: 'asc',
      },
    });

    return {
      jsonBody: preferences satisfies GetTopicPreferencesResponse,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export async function updateTopicPreferences(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
) {
  if (!session.isStudent) {
    context.warn('not a student');

    return {
      status: 401,
      jsonBody: {
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  try {
    const newPreferencesData = await request.json();
    const parsed = updateTopicPreferencesInput.safeParse(newPreferencesData);

    if (!parsed.success) {
      context.warn(parsed.error.errors);
      return {
        status: 422,
        jsonBody: {
          message: getLabel('UNPROCESSABLE_ENTITY', request),
          error: parsed.error,
        },
      };
    }

    const duplicateRanks = parsed.data.some((preference, index) => {
      const ranks = parsed.data.map((preference) => preference.rank);
      return ranks.indexOf(preference.rank) !== index;
    });
    if (duplicateRanks) {
      return {
        status: 422,
        jsonBody: {
          message: getLabel('DUPLICATE_RANKS', request),
        },
      };
    }

    await Promise.all(
      parsed.data.map(
        async (preference) =>
          await prisma.studentTopicPreference.update({
            where: {
              studentId_topicId: {
                studentId: session.userId,
                topicId: preference.topicId,
              },
            },
            data: {
              rank: preference.rank,
            },
          }),
      ),
    );

    const updatedPreferences = await prisma.studentTopicPreference.findMany({
      where: {
        studentId: session.userId,
      },
      include: {
        topic: {
          include: {
            instructor: true,
          },
        },
      },
      orderBy: {
        rank: 'asc',
      },
    });

    return {
      jsonBody: updatedPreferences satisfies GetTopicPreferencesResponse,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
const updateTopicPreferencesInput = z.array(
  z.object({
    topicId: z.string(),
    rank: z.number(),
  }),
);

export async function createTopicPreference(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isStudent) {
    context.warn('not a student');

    return {
      status: 401,
      jsonBody: {
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  try {
    const newPreferenceData = await request.json();
    const parsed = newPreferenceInput.safeParse(newPreferenceData);

    if (!parsed.success) {
      return {
        status: 422,
        jsonBody: {
          message: getLabel('UNPROCESSABLE_ENTITY', request),
          error: parsed.error,
        },
      };
    }

    const alreadyExists = await prisma.studentTopicPreference.findUnique({
      where: {
        studentId_topicId: {
          studentId: session.userId,
          topicId: parsed.data.topicId,
        },
      },
    });
    if (alreadyExists) {
      context.warn('topic preference already exists');
      return {
        status: 409,
        jsonBody: {
          message: getLabel('TOPIC_PREFERENCE_ALREADY_EXISTS', request),
        },
      };
    }

    const { _count } = await prisma.studentTopicPreference.aggregate({
      where: {
        studentId: parsed.data.studentId,
      },
      _count: true,
    });

    const newPreference = await prisma.studentTopicPreference.create({
      data: {
        topicId: parsed.data.topicId,
        studentId: session.userId,
        rank: _count + 1,
      },
    });

    return {
      jsonBody: newPreference satisfies StudentTopicPreference,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
const newPreferenceInput = z.object({
  studentId: z.string().optional(),
  topicId: z.string(),
});

export async function deleteTopicPreference(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isStudent) {
    context.warn('not a student');

    return {
      status: 401,
      jsonBody: {
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  try {
    const { studentTopicPreferenceId } = request.params;
    if (!studentTopicPreferenceId) {
      context.warn('no topicId provided');

      return {
        status: 422,
        jsonBody: {
          message: getLabel('UNPROCESSABLE_ENTITY', request),
          error: 'no topicId provided',
        },
      };
    }

    const deletedPreference = await prisma.studentTopicPreference.delete({
      where: {
        studentId_topicId: {
          studentId: session.userId,
          topicId: studentTopicPreferenceId,
        },
      },
    });

    await prisma.studentTopicPreference.updateMany({
      where: {
        studentId: session.userId,
        rank: {
          gt: deletedPreference.rank,
        },
      },
      data: {
        rank: {
          decrement: 1,
        },
      },
    });

    return {
      jsonBody: deletedPreference satisfies StudentTopicPreference,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
