import { Instructor, Prisma } from '@prisma/client';
import { createRouter } from '../trpc';
import { z } from 'zod';
import { protectedProcedure } from '../middlewares/session';
import { TRPCError } from '@trpc/server';
import { instructorProcedure } from '../middlewares/instructor';

export const topicRouter = createRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        instructorId: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const queryArgs: Prisma.TopicWhereInput = {};
      if (input.instructorId) {
        queryArgs.instructorId = input.instructorId;
      }

      if (!ctx.session.isStudent) {
        const topics = await ctx.db.topic.findMany({
          where: queryArgs,
          include: {
            instructor: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                assignedStudents: true,
              },
            },
          },
        });
        return topics.map((t) => ({
          ...t,
          isAddedToPreferences: false,
        }));
      }

      const topics = await ctx.db.topic.findMany({
        where: queryArgs,
        include: {
          instructor: {
            select: {
              name: true,
              id: true,
              max: true,
            },
          },
          studentTopicPreferences: {
            where: {
              studentId: ctx.session.userId,
            },
          },
          _count: {
            select: {
              assignedStudents: true,
            },
          },
        },
      });

      const instructorFullness = new Map<Instructor['id'], number>();
      topics.forEach((topic) => {
        instructorFullness.set(
          topic.instructorId,
          (instructorFullness.get(topic.instructorId) ?? 0) +
            topic._count.assignedStudents,
        );
      });

      const topicPreferences = topics.flatMap(
        (topic) => topic.studentTopicPreferences,
      );

      const filteredTopics = topics
        .filter((topic) => topic._count.assignedStudents < topic.capacity)
        .filter(
          (topic) =>
            instructorFullness.get(topic.instructor.id)! < topic.instructor.max,
        )
        .map((topic) => ({
          ...topic,
          capacity: -1,
          instructor: {
            name: topic.instructor.name,
          },
          isAddedToPreferences: topicPreferences.some(
            (preference) => preference.topicId === topic.id,
          ),

          studentTopicPreferences: null,
          _count: {
            assignedStudents: null,
          },
        }));

      return filteredTopics;
    }),
  delete: instructorProcedure
    .input(z.object({ topicId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const topicId = input.topicId;
      const userId = ctx.session.userId;

      const topic = await ctx.db.topic.findUnique({
        where: {
          id: topicId,
        },
      });

      if (!topic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: ctx.getLabel('TOPIC_NOT_FOUND'),
        });
      }

      if (topic.instructorId !== userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: ctx.getLabel('UNAUTHORIZED_REQUEST'),
        });
      }

      const [_, __, deletedTopic] = await ctx.db.$transaction([
        ctx.db.studentTopicPreference.deleteMany({
          where: {
            topicId: topicId,
          },
        }),
        ctx.db.topicCoursePreference.deleteMany({
          where: {
            topicId: topicId,
          },
        }),
        ctx.db.topic.delete({
          where: {
            id: topicId,
          },
        }),
      ]);

      return deletedTopic;
    }),
  create: instructorProcedure
    .input(
      z.object({
        title: z.string(),
        language: z.enum(['hu', 'en']).default('hu'),
        type: z.enum(['normal', 'tdk', 'research', 'internship']),
        capacity: z.number().min(1),
        description: z.string().max(500).min(1),
        researchQuestion: z.string().max(500).nullish(),
        recommendedLiterature: z.string().max(500).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const topicWithSameTitle = await ctx.db.topic.findFirst({
        where: {
          title: input.title,
        },
      });
      if (topicWithSameTitle) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: ctx.getLabel('TOPIC_ALREADY_EXISTS'),
        });
      }

      const instructor = await ctx.db.instructor.findUnique({
        where: {
          id: ctx.session.userId,
        },
      });
      if (!instructor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: ctx.getLabel('USER_NOT_FOUND'),
        });
      }

      const topic = await ctx.db.topic.create({
        data: {
          ...input,
          instructorId: instructor.id,
        },
      });

      return topic;
    }),
  update: instructorProcedure
    .input(
      z
        .object({
          id: z.string(),
        })
        .merge(
          z
            .object({
              title: z.string(),
              language: z.enum(['hu', 'en']).default('hu'),
              type: z.enum(['normal', 'tdk', 'research', 'internship']),
              capacity: z.number().min(0),
              description: z.string().max(500).min(1),
              researchQuestion: z.string().max(500).nullish(),
              recommendedLiterature: z.string().max(500).nullish(),
            })
            .partial(),
        ),
    )
    .mutation(async ({ input, ctx }) => {
      const assignedStudents = await ctx.db.student.aggregate({
        _count: true,
        where: {
          assignedTopicId: input.id,
        },
      });

      if (input.capacity && assignedStudents._count > input.capacity) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: ctx
            .getLabel('CAPACITY_CAN_NOT_BE_LOWER_THAN')
            .replace('${}', assignedStudents._count.toString()),
        });
      }

      const topicToBeUpdated = await ctx.db.topic.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!topicToBeUpdated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: ctx.getLabel('TOPIC_NOT_FOUND'),
        });
      }

      if (topicToBeUpdated.instructorId !== ctx.session.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: ctx.getLabel('UNAUTHORIZED_REQUEST'),
        });
      }

      const topic = await ctx.db.topic.update({
        where: {
          id: input.id,
        },
        data: { ...input, id: undefined },
      });

      return topic;
    }),
});
