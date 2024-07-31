import { Instructor } from '@prisma/client';
import { createRouter, protectedProcedure } from '../trpc';

export const topicRouter = createRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.isStudent) {
      const topics = await ctx.db.topic.findMany({
        include: {
          instructor: {
            select: {
              name: true,
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
        instructor: {
          name: topic.instructor.name,
        },
        isAddedToPreferences: topicPreferences.some(
          (preference) => preference.topicId === topic.id,
        ),

        studentTopicPreferences: null,
        _count: null,
      }));

    return filteredTopics;
  }),
});
