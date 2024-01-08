import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import {
  Instructor,
  Student,
  StudentTopicPreference,
  Topic,
} from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../db';
import { Session } from '../../lib/utils';
import { getLabel } from '../../labels';

export type GetStudentsOutput = (Student & {
  assignedTopic:
    | (Topic & {
        instructor: Instructor;
      })
    | null;
  studentTopicPreferences: StudentTopicPreference[];
})[];
export async function getStudents(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
) {
  if (!session.isAdmin) {
    context.warn('getStudents can only be called by admins');

    return {
      status: 401,
      jsonBody: {
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  const students = await prisma.student.findMany({
    include: {
      assignedTopic: {
        include: {
          instructor: true,
        },
      },
      studentTopicPreferences: true,
    },
  });

  return {
    jsonBody: students satisfies GetStudentsOutput,
  };
}

const updateStudentInput = z.object({
  id: z.string(),
  assignedTopicId: z.string().optional(),
});
export type UpdateStudentInput = z.infer<typeof updateStudentInput>;
export type UpdateStudentOutput = Student;
export async function updateStudent(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
) {
  if (!session.isAdmin) {
    context.warn('updateStudent can only be called by admins');

    return {
      status: 401,
      jsonBody: {
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }

  try {
    const studentData = await request.json();
    const parsed = updateStudentInput.safeParse(studentData);

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

    const updatedStudent = await prisma.student.update({
      where: {
        id: parsed.data.id,
      },
      data: {
        assignedTopicId: parsed.data.assignedTopicId,
      },
    });

    return {
      jsonBody: updatedStudent satisfies UpdateStudentOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export type GetTopicPreferencesOutput = (StudentTopicPreference & {
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
      jsonBody: preferences satisfies GetTopicPreferencesOutput,
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
export type UpdateTopicPreferencesInput = z.infer<
  typeof updateTopicPreferencesInput
>;
export type UpdateTopicPreferencesOutput = StudentTopicPreference[];
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
      jsonBody: updatedPreferences satisfies UpdateTopicPreferencesOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

const createPreferenceInput = z.object({
  topicId: z.string(),
});
export type CreateTopicPreferenceInput = z.infer<typeof createPreferenceInput>;
export type CreateTopicPreferenceOutput = StudentTopicPreference;
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
    const parsed = createPreferenceInput.safeParse(newPreferenceData);

    if (!parsed.success) {
      return {
        status: 422,
        jsonBody: {
          message: getLabel('UNPROCESSABLE_ENTITY', request),
          error: parsed.error,
        },
      };
    }

    const topic = await prisma.topic.findUnique({
      where: {
        id: parsed.data.topicId,
      },
      include: {
        _count: {
          select: {
            assignedStudents: true,
          },
        },
      },
    });

    if (!topic) {
      context.warn('topic not found');
      return {
        status: 404,
        jsonBody: {
          message: getLabel('TOPIC_NOT_FOUND', request),
        },
      };
    }

    if (topic._count.assignedStudents >= topic.capacity) {
      context.warn('topic is full');
      return {
        status: 409,
        jsonBody: {
          message: getLabel('TOPIC_FULL', request),
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
        studentId: session.userId,
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
      jsonBody: newPreference satisfies CreateTopicPreferenceOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}

export type DeleteTopicPreferenceOutput = StudentTopicPreference;
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
      jsonBody: deletedPreference satisfies DeleteTopicPreferenceOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
