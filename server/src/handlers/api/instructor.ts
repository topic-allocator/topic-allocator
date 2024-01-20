import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { Instructor, Student, Topic } from '@prisma/client';
import { db } from '../../db';
import { Session } from '../../lib/utils';
import { getLabel } from '../../labels';

export type GetInstructorsOutput = Instructor[];
export async function getInstructors(
  _request: HttpRequest,
  context: InvocationContext,
  _session: Session,
) {
  try {
    const instructors = await db.instructor.findMany();
    return {
      jsonBody: instructors satisfies GetInstructorsOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export type GetOwnTopicsOutput = (Topic & {
  _count: {
    assignedStudents: number;
  };
})[];
export async function getOwnTopics(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isInstructor) {
    context.warn('getOwnTopics can only be called by instructors');

    return {
      status: 401,
      jsonBody: {
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  try {
    const topics = await db.topic.findMany({
      where: {
        instructorId: session.userId,
      },
      include: {
        _count: {
          select: {
            assignedStudents: true,
          },
        },
      },
    });

    return {
      jsonBody: topics satisfies GetOwnTopicsOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export type GetAssignedStudentsForInstructorOutput = (Student & {
  assignedTopic: Topic | null;
})[];
export async function getAssignedStudentsForInstructor(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
) {
  if (!session.isInstructor) {
    context.warn('getAssignedStudents can only be called by instructors');

    return {
      status: 401,
      jsonBody: {
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  const topics = await db.topic.findMany({
    where: {
      instructorId: session.userId,
    },
  });

  const students = await db.student.findMany({
    where: {
      assignedTopicId: {
        in: topics.map((topic) => topic.id),
      },
    },
    include: {
      assignedTopic: true,
    },
  });

  return {
    jsonBody: students satisfies GetAssignedStudentsForInstructorOutput,
  };
}
