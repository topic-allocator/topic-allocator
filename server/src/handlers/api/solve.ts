import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { prisma } from '../../db';
import { buildSolverInput } from '../../lib/utils';
import { runSolver } from '../../solver/run-solver';

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

    const result = await runSolver(input);

    await prisma.student.updateMany({
      data: {
        assignedTopicId: null,
      },
    });
    await prisma.$transaction(
      result.map(({ studentId, topicId }) => {
        return prisma.student.update({
          data: {
            assignedTopicId: topicId,
          },
          where: {
            id: studentId,
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
