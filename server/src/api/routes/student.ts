import { Prisma } from '@prisma/client';
import { createRouter } from '../trpc';
import { z } from 'zod';
import { instructorProcedure } from '../middlewares/instructor';
import { protectedProcedure } from '../middlewares/session';
import { TRPCError } from '@trpc/server';
import { adminProcedure } from '../middlewares/admin';

export const studentRouter = createRouter({
  getMany: instructorProcedure
    .input(
      z
        .object({
          assignedTopicId: z.string().optional(),
          instructorId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      const queryArgs: Prisma.StudentWhereInput = {};
      if (input?.assignedTopicId) {
        queryArgs.assignedTopicId = input.assignedTopicId;
      }

      if (input?.instructorId) {
        const topics = await ctx.db.topic.findMany({
          where: {
            instructorId: input.instructorId,
          },
        });

        queryArgs.assignedTopicId = {
          in: topics.map((topic) => topic.id),
        };
      }

      const students = await ctx.db.student.findMany({
        where: queryArgs,
        include: {
          assignedTopic: {
            include: {
              instructor: true,
            },
          },
          studentTopicPreferences: ctx.session.isAdmin,
        },
      });

      return students;
    }),
  getPreferences: protectedProcedure
    .input(z.object({ studentId: z.string() }).optional())
    .query(async ({ input, ctx }) => {
      const preferences = await ctx.db.studentTopicPreference.findMany({
        where: {
          studentId: input?.studentId ?? ctx.session.userId,
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

      return preferences;
    }),
  createTopicPreference: protectedProcedure
    .input(
      z.object({
        topicId: z.string(),
        studentId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.isStudent && !input.studentId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: ctx.getLabel('UNAUTHORIZED_REQUEST'),
        });
      }

      const studentId = input.studentId ?? ctx.session.userId;

      const student = await ctx.db.student.findUnique({
        where: {
          id: studentId,
        },
      });

      // students are not allowed to modify their preferences after they have been assigned to a topic
      if (student?.assignedTopicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: ctx.getLabel('UNAUTHORIZED_REQUEST'),
        });
      }

      const topic = await ctx.db.topic.findUnique({
        where: {
          id: input.topicId,
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
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: ctx.getLabel('TOPIC_NOT_FOUND'),
        });
      }

      // TODO: is this correct?
      if (topic._count.assignedStudents >= topic.capacity) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: ctx.getLabel('TOPIC_FULL'),
        });
      }

      const alreadyExists = await ctx.db.studentTopicPreference.findUnique({
        where: {
          studentId_topicId: {
            studentId,
            topicId: input.topicId,
          },
        },
      });
      if (alreadyExists) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: ctx.getLabel('TOPIC_PREFERENCE_ALREADY_EXISTS'),
        });
      }

      const { _count } = await ctx.db.studentTopicPreference.aggregate({
        where: {
          studentId,
        },
        _count: true,
      });

      const newPreference = await ctx.db.studentTopicPreference.create({
        data: {
          topicId: input.topicId,
          studentId,
          rank: _count + 1,
        },
      });

      return newPreference;
    }),
  updateTopicPreferences: protectedProcedure
    .input(
      z.array(
        z.object({
          topicId: z.string(),
          rank: z.number(),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.isStudent) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: ctx.getLabel('UNAUTHORIZED_REQUEST'),
        });
      }

      const student = await ctx.db.student.findUnique({
        where: {
          id: ctx.session.userId,
        },
      });

      if (!student) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: ctx.getLabel('USER_NOT_FOUND'),
        });
      }

      // students are not allowed to modify their preferences after they have been assigned to a topic
      if (student.assignedTopicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: ctx.getLabel('UNAUTHORIZED_REQUEST'),
        });
      }

      const duplicateRanks = input.some((preference, index) => {
        const ranks = input.map((preference) => preference.rank);
        return ranks.indexOf(preference.rank) !== index;
      });
      if (duplicateRanks) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: ctx.getLabel('DUPLICATE_RANKS'),
        });
      }

      const updatedPreferences = await ctx.db.$transaction(
        input.map((preference) =>
          ctx.db.studentTopicPreference.update({
            where: {
              studentId_topicId: {
                studentId: ctx.session.userId,
                topicId: preference.topicId,
              },
            },
            data: {
              rank: preference.rank,
            },
            include: {
              topic: {
                include: {
                  instructor: true,
                },
              },
            },
          }),
        ),
      );

      return updatedPreferences.sort((a, b) => a.rank - b.rank);
    }),
  deleteTopicPreference: protectedProcedure
    .input(
      z.object({
        topicPreferenceId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const student = await ctx.db.student.findUnique({
        where: {
          id: ctx.session.userId,
        },
      });

      // students are not allowed to modify their preferences after they have been assigned to a topic
      if (student?.assignedTopicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: ctx.getLabel('UNAUTHORIZED_REQUEST'),
        });
      }

      const deletedPreference = await ctx.db.studentTopicPreference.delete({
        where: {
          studentId_topicId: {
            studentId: ctx.session.userId,
            topicId: input.topicPreferenceId,
          },
        },
      });

      await ctx.db.studentTopicPreference.updateMany({
        where: {
          studentId: ctx.session.userId,
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

      return deletedPreference;
    }),
  update: adminProcedure
    .input(z.object({ id: z.string(), assignedTopicId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.student.update({
        where: {
          id: input.id,
        },
        data: {
          assignedTopicId: input.assignedTopicId,
        },
      });
    }),
  // TODO: is this necessary?
  getAssignedTopic: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.isStudent) {
      ctx.warn('not a student');

      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: ctx.getLabel('UNAUTHORIZED_REQUEST'),
      });
    }

    const student = await ctx.db.student.findUnique({
      where: {
        id: ctx.session.userId,
      },
      include: {
        assignedTopic: {
          include: {
            instructor: true,
          },
        },
      },
    });

    if (!student) {
      ctx.warn('student not found');
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: ctx.getLabel('USER_NOT_FOUND'),
      });
    }

    if (!student.assignedTopic) {
      return {
        assignedTopic: null,
      };
    }

    return {
      assignedTopic: {
        title: student.assignedTopic.title,
        type: student.assignedTopic.type,
        description: student.assignedTopic.description,
        instructorName: student.assignedTopic.instructor.name,
      },
    };
  }),
});
