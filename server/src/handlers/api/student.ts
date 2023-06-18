import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { StudentTopicPreference } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../db';
import { Session } from '../../utils';

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
        message: 'UNAUTHORIZED_REQUEST',
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
          message: 'INVALID_REQUEST_BODY',
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
          message: 'TOPIC_PREFERENCE_ALREADY_EXISTS',
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
      jsonBody: { ...newPreference } satisfies StudentTopicPreference,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
const newPreferenceInput = z.object({
  studentId: z.number().optional(),
  topicId: z.number(),
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
        message: 'UNAUTHORIZED_REQUEST',
      },
    };
  }

  try {
    const { studentTopicPreferenceId } = request.params;
    if (!studentTopicPreferenceId) {
      context.warn('no topicId provided');

      return {
        status: 400,
        jsonBody: {
          message: 'INVALID_REQUEST',
        },
      };
    }

    const deletedPreference = await prisma.studentTopicPreference.delete({
      where: {
        studentId_topicId: {
          studentId: session.userId,
          topicId: parseInt(studentTopicPreferenceId),
        },
      },
    });

    return {
      jsonBody: { ...deletedPreference } satisfies StudentTopicPreference,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
