import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { z } from 'zod';
import { Course, TopicCoursePreference, db } from '../../db';
import { Session } from '../../lib/utils';
import { getLabel } from '../../labels';

export type GetCoursesOutput = (Course & {
  weight?: number;
})[];
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
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  try {
    let courses = await db.course.findMany();

    if (request.query.get('topicId')) {
      const topicCoursePreferences = await db.topicCoursePreference.findMany({
        where: {
          topicId: request.query.get('topicId')!,
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
      jsonBody: courses satisfies GetCoursesOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

const createTopicCoursePreferenceInput = z.object({
  topicId: z.string(),
  courseId: z.string(),
  weight: z.number().min(0).max(5),
});
export type CreateTopicCoursePreferenceInput = z.infer<
  typeof createTopicCoursePreferenceInput
>;
export type CreateTopicCoursePreferenceOutput = TopicCoursePreference;
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
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  try {
    const newPreferenceData = await request.json();
    const parsed =
      createTopicCoursePreferenceInput.safeParse(newPreferenceData);

    if (!parsed.success) {
      return {
        status: 422,
        jsonBody: {
          message: getLabel('UNPROCESSABLE_ENTITY', request),
          error: parsed.error,
        },
      };
    }

    const newPreference = await db.topicCoursePreference.create({
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

export type DeleteTopicCoursePreferenceOutput = TopicCoursePreference;
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
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  try {
    const courseId = request.query.get('courseId');
    const topicId = request.query.get('topicId');

    if (!courseId || !topicId) {
      return {
        status: 422,
        jsonBody: {
          message: getLabel('UNPROCESSABLE_ENTITY', request),
          error: 'courseId and topicId must be provided',
        },
      };
    }

    const preferenceToDelete = await db.topicCoursePreference.findUnique({
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
          message: getLabel('PREFERENCE_NOT_FOUND', request),
        },
      };
    }

    if (preferenceToDelete.topic.instructorId !== session.userId) {
      context.warn('topicCoursePreference can only be deleted by its creator');
      return {
        status: 401,
        jsonBody: {
          message: getLabel('UNAUTHORIZED_REQUEST', request),
        },
      };
    }

    const deletedPreference = await db.topicCoursePreference.delete({
      where: {
        topicId_courseId: {
          courseId,
          topicId,
        },
      },
    });

    return {
      jsonBody: deletedPreference satisfies DeleteTopicCoursePreferenceOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
