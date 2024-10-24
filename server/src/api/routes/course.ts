import { createRouter } from '../trpc';
import { z } from 'zod';
import { instructorProcedure } from '../middlewares/instructor';
import { Course, TopicCoursePreference } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export const courseRouter = createRouter({
  getMany: instructorProcedure
    .input(z.object({ topicId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const courses: (Course & {
        topicCoursePreferences?: TopicCoursePreference[];
      })[] = await ctx.db.course.findMany({
        include: input.topicId
          ? {
              topicCoursePreferences: {
                select: {
                  weight: true,
                },
                where: {
                  topicId: input.topicId,
                },
              },
            }
          : undefined,
      });

      const transformedCourses: (Course & { weight?: number })[] = courses.map(
        (course) => {
          if (
            course.topicCoursePreferences?.length &&
            course.topicCoursePreferences.length > 1
            // note that these are preferences related to a single topic
            // so there should not be more than one
          ) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Error in database state, this should not happen!',
            });
          }

          const weight = course.topicCoursePreferences?.[0]?.weight;
          return {
            ...course,
            weight: weight && Number(weight),
            topicCoursePreferences: null,
          };
        },
      );

      return transformedCourses;
    }),
  createTopicPreference: instructorProcedure
    .input(
      z.object({
        topicId: z.string(),
        weight: z.number(),
        courseId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const newPreference = await ctx.db.topicCoursePreference.create({
        data: input,
      });

      return {
        ...newPreference,
        weight: Number(newPreference.weight),
      };
    }),
  deleteTopicPreference: instructorProcedure
    .input(
      z.object({
        topicId: z.string(),
        courseId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const preferenceToDelete = await ctx.db.topicCoursePreference.findUnique({
        where: {
          topicId_courseId: {
            courseId: input.courseId,
            topicId: input.topicId,
          },
        },
        include: {
          topic: {
            select: {
              instructorId: true,
            },
          },
        },
      });

      if (!preferenceToDelete) {
        return {
          status: 404,
          jsonBody: {
            message: ctx.getLabel('PREFERENCE_NOT_FOUND'),
          },
        };
      }

      if (preferenceToDelete.topic.instructorId !== ctx.session.userId) {
        ctx.warn('topicCoursePreference can only be deleted by its creator');
        return {
          status: 401,
          jsonBody: {
            message: ctx.getLabel('UNAUTHORIZED_REQUEST'),
          },
        };
      }

      const deletedPreference = await ctx.db.topicCoursePreference.delete({
        where: {
          topicId_courseId: {
            courseId: input.courseId,
            topicId: input.topicId,
          },
        },
      });

      return deletedPreference;
    }),
});
