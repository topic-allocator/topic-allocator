import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { db } from '../../db';
import { Session, buildSolverInput } from '../../lib/utils';
import { z } from 'zod';
import { getLabel } from '../../labels';

const solverResultSchema = z.object({
  status: z.number(),
  matchings: z.array(
    z.object({
      student_id: z.string(),
      topic_id: z.string(),
    }),
  ),
});
export type SolverOutput = z.infer<typeof solverResultSchema>;
export async function solve(
  request: HttpRequest,
  context: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  if (!session.isAdmin) {
    context.warn('solve can only be called by admins');

    return {
      status: 401,
      jsonBody: {
        message: getLabel('UNAUTHORIZED_REQUEST', request),
      },
    };
  }
  try {
    const students = await db.student.findMany({
      select: {
        id: true,
        studentTopicPreferences: true,
        studentCourseCompletions: true,
        assignedTopic: true,
      },
    });
    const topics = await db.topic.findMany({
      select: {
        id: true,
        capacity: true,
        topicCoursePreferences: true,
        instructorId: true,
      },
    });
    const instructors = await db.instructor.findMany({
      select: {
        id: true,
        min: true,
        max: true,
      },
    });

    const studentsWithSpecialTopics = students.filter(
      (student) =>
        student.assignedTopic &&
        ['tdk', 'research', 'internship'].includes(student.assignedTopic?.type),
    );

    const studentsWithoutSpecialTopics = students.filter(
      (student) => studentsWithSpecialTopics.indexOf(student) === -1,
    );

    const instructorsWithCorrectedCapacity = instructors.map((instructor) => {
      const assignedStudents = studentsWithSpecialTopics.filter(
        (student) => student.assignedTopic?.instructorId === instructor.id,
      ).length;
      return {
        ...instructor,
        capacity: instructor.max - assignedStudents,
      };
    });

    const input = buildSolverInput(
      studentsWithoutSpecialTopics,
      topics,
      instructorsWithCorrectedCapacity,
    );

    if (!process.env.SOLVER_ENDPOINT) {
      throw new Error('SOLVER_ENDPOINT env variable not defined');
    }
    const res = await fetch(process.env.SOLVER_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      context.error(await res.json());
      return {
        status: 500,
      };
    }

    const result = solverResultSchema.safeParse(await res.json());

    if (!result.success) {
      context.error(result.error);
      return {
        status: 500,
      };
    }

    await db.$transaction(
      result.data.matchings.map(({ student_id, topic_id }) => {
        return db.student.update({
          data: {
            assignedTopicId: topic_id,
          },
          where: {
            id: student_id,
          },
        });
      }),
    );

    return {
      jsonBody: result.data satisfies SolverOutput,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
      jsonBody: {
        error,
      },
    };
  }
}
