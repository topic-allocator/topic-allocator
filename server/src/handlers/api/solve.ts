import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { prisma } from '../../db';
import { buildSolverInput } from '../../lib/utils';
import { z } from 'zod';

const solverResultSchema = z.object({
  status: z.number(),
  matchings: z.array(
    z.object({
      student_id: z.string(),
      topic_id: z.string(),
    }),
  ),
});

export async function solve(
  _request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        studentTopicPreferences: true,
        studentCourseCompletions: true,
      },
    });
    const topics = await prisma.topic.findMany({
      select: {
        id: true,
        capacity: true,
        topicCoursePreferences: true,
        instructorId: true,
      },
    });
    const instructors = await prisma.instructor.findMany({
      select: {
        id: true,
        min: true,
        max: true,
      },
    });

    const input = buildSolverInput(students, topics, instructors);

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

    await prisma.student.updateMany({
      data: {
        assignedTopicId: null,
      },
    });
    await prisma.$transaction(
      result.data.matchings.map(({ student_id, topic_id }) => {
        return prisma.student.update({
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
      jsonBody: result,
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
