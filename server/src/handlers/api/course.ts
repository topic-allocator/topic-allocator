import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { z } from 'zod';
import { prisma } from '../../db';
import { Session } from '../../lib';

export async function getCourses(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isInstructor) {
    context.warn('getCourses can only be called by instructors');

    return {
      status: 401,
      jsonBody: {
        message: 'UNAUTHORIZED_REQUEST',
      },
    };
  }

  try {
    let courses = await prisma.course.findMany();

    if (request.query.get('topicId')) {
      const topicCoursePreferences =
        await prisma.topicCoursePreference.findMany({
          where: {
            topicId: Number(request.query.get('topicId')),
          },
        });

      courses = courses.map((course) => {
        const preference = topicCoursePreferences.find(
          (preference) => preference.courseId === course.id,
        );

        return {
          ...course,
          weight: Number(preference?.weight),
        };
      });
    }

    return {
      jsonBody: courses,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

const newPreferenceInput = z.object({
  topicId: z.number(),
  courseId: z.number(),
  weight: z.number().min(0).max(5),
});
export async function createTopicCoursePreference(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isInstructor) {
    context.warn(
      'createCourseTopicPreference can only be called by instructors',
    );

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
          message: 'UNPROCESSABLE_ENTITY',
        },
      };
    }

    const newPreference = await prisma.topicCoursePreference.create({
      data: parsed.data,
    });

    return {
      jsonBody: {
        ...newPreference,
        weight: Number(newPreference.weight),
      },
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export async function deleteTopicCoursePreference(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isInstructor) {
    context.warn(
      'deleteCourseTopicPreference can only be called by instructors',
    );

    return {
      status: 401,
      jsonBody: {
        message: 'UNAUTHORIZED_REQUEST',
      },
    };
  }

  try {
    const courseId = Number(request.query.get('courseId'));
    const topicId = Number(request.query.get('topicId'));

    if (!courseId || !topicId) {
      return {
        status: 422,
        jsonBody: {
          message: 'UNPROCESSABLE_ENTITY',
        },
      };
    }

    const preferenceToDelete = await prisma.topicCoursePreference.findUnique({
      where: {
        topicId_courseId: {
          courseId,
          topicId,
        },
      },
      include: {
        topic: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!preferenceToDelete) {
      return {
        status: 404,
        jsonBody: {
          message: 'NOT_FOUND',
        },
      };
    }

    if (preferenceToDelete.topic.instructorId !== session.userId) {
      context.warn('topicCoursePreference can only be deleted by its creator');
      return {
        status: 401,
        jsonBody: {
          message: 'UNAUTHORIZED_REQUEST',
        },
      };
    }

    const deletedPreference = await prisma.topicCoursePreference.delete({
      where: {
        topicId_courseId: {
          courseId,
          topicId,
        },
      },
    });

    return {
      jsonBody: {
        ...deletedPreference,
        weight: Number(deletedPreference.weight),
      },
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
