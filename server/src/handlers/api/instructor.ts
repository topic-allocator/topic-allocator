import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { Instructor, Student, Topic } from '@prisma/client';
import { db } from '../../db';
import { Session } from '../../lib/utils';
import { extractLabel } from '../../labels';
import { z } from 'zod';

export type GetInstructorOutput = Instructor;
export async function getInstructor(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
) {
  if (!session.isInstructor) {
    context.warn('getInstructor can only be called by instructors');

    return {
      status: 401,
      jsonBody: {
        message: extractLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  try {
    const instructor = await db.instructor.findUnique({
      where: {
        id: request.params.id,
      },
    });

    if (!instructor) {
      return {
        status: 404,
        jsonBody: {
          message: extractLabel('USER_NOT_FOUND', request),
        },
      };
    }

    return {
      jsonBody: instructor satisfies GetInstructorOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export type GetInstructorsOutput = Instructor[];
export async function getInstructors(
  _: HttpRequest,
  context: InvocationContext,
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

export type GetInstructorTopicsOutput = (Topic & {
  _count: {
    assignedStudents: number;
  };
})[];
export async function getInstructorTopics(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isInstructor) {
    context.warn('getOwnTopics can only be called by instructors');

    return {
      status: 401,
      jsonBody: {
        message: extractLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  try {
    const topics = await db.topic.findMany({
      where: {
        instructorId: request.params.id,
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
      jsonBody: topics satisfies GetInstructorTopicsOutput,
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
        message: extractLabel('UNAUTHORIZED_REQUEST', request),
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

const updateInstructorMinMaxInput = z.array(
  z.object({
    id: z.string().min(1),
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }),
);
export type UpdateInstructorMinMaxInput = z.infer<
  typeof updateInstructorMinMaxInput
>;
export type UpdateInstructorMinMaxOutput = Instructor[];
export async function updateInstructorMinMax(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
) {
  if (!session.isAdmin) {
    context.warn('updateInstructorMinMax can only be called by admins');

    return {
      status: 401,
      jsonBody: {
        message: extractLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  const updateData = await request.json();
  const parsed = updateInstructorMinMaxInput.safeParse(updateData);

  if (!parsed.success) {
    return {
      status: 400,
      jsonBody: {
        message: extractLabel('UNPROCESSABLE_ENTITY', request),
        error: parsed.error,
      },
    };
  }

  try {
    const updatedInstructors = await db.$transaction(
      parsed.data.map((instructor) =>
        db.instructor.update({
          where: {
            id: instructor.id,
          },
          data: {
            min: instructor.min,
            max: instructor.max,
          },
        }),
      ),
    );

    return {
      status: 200,
      jsonBody: updatedInstructors satisfies UpdateInstructorMinMaxOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
