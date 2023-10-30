import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { Topic } from '@prisma/client';
import { prisma } from '../../db';
import { Session } from '../../lib';

export async function getInstructors(
  _request: HttpRequest,
  context: InvocationContext,
  _session: Session,
) {
  try {
    const instructors = await prisma.instructor.findMany();
    return {
      jsonBody: instructors,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export type GetOwnTopicsResponse = Topic[];
export async function getOwnTopics(
  _: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isInstructor) {
    context.warn('getOwnTopics can only be called by instructors');

    return {
      status: 401,
      jsonBody: {
        message: 'UNAUTHORIZED_REQUEST',
      },
    };
  }

  try {
    const topics = await prisma.topic.findMany({
      where: {
        instructorId: session.userId,
      },
    });

    return {
      jsonBody: topics satisfies GetOwnTopicsResponse,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export async function getAssignedStudentsForInstructor(
  _: HttpRequest,
  context: InvocationContext,
  session: Session,
) {
  if (!session.isInstructor) {
    context.warn('getAssignedStudents can only be called by instructors');

    return {
      status: 401,
      jsonBody: {
        message: 'UNAUTHORIZED_REQUEST',
      },
    };
  }

  const topics = await prisma.topic.findMany({
    where: {
      instructorId: session.userId,
    },
  });

  const students = await prisma.student.findMany({
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
    jsonBody: students,
  };
}
