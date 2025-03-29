import { createRouter } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure } from '../middlewares/admin';
import { buildSolverInput } from '../../lib/utils';

const solverResultSchema = z.object({
  status: z.number(),
  matchings: z.array(
    z.object({
      student_id: z.string(),
      topic_id: z.string(),
    }),
  ),
});

export const solverRouter = createRouter({
  solve: adminProcedure.mutation(async ({ ctx }) => {
    await ctx.db.student.updateMany({
      data: {
        assignedTopicId: null,
      },
      where: {
        assignedTopic: {
          type: 'normal',
        },
      },
    });

    const students = await ctx.db.student.findMany({
      select: {
        id: true,
        studentTopicPreferences: true,
        studentCourseCompletions: true,
        assignedTopic: true,
      },
    });
    const topics = await ctx.db.topic.findMany({
      select: {
        id: true,
        capacity: true,
        topicCoursePreferences: true,
        instructorId: true,
      },
    });
    const instructors = await ctx.db.instructor.findMany({
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
        max: Math.max(instructor.max - assignedStudents, 0),
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
      ctx.error(await res.json());
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      });
    }

    const result = solverResultSchema.safeParse(await res.json());

    if (!result.success) {
      ctx.error(result.error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      });
    }

    await ctx.db.$transaction(
      result.data.matchings.map(({ student_id, topic_id }) => {
        return ctx.db.student.update({
          data: {
            assignedTopicId: topic_id,
          },
          where: {
            id: student_id,
          },
        });
      }),
    );

    return result.data;
  }),
});
