import { prisma } from './db';
import { range } from './lib/utils';

async function main() {
  try {
    await prisma.$queryRaw`
    DELETE FROM "student_topic_preference";
    DELETE FROM "student_course_completion";
    DELETE FROM "topic_course_preference";

    DELETE FROM "topic";
    DBCC CHECKIDENT ('topic', RESEED, 0);
    DELETE FROM "course";
    DBCC CHECKIDENT ('course', RESEED, 0);
    DELETE FROM "student";
    DBCC CHECKIDENT ('student', RESEED, 0);
    DELETE FROM "instructor";
    DBCC CHECKIDENT ('instructor', RESEED, 0);
  `;

    await prisma.student.create({
      data: {
        email: 'student@lti.com',
        name: 'Test Student',
      },
    });

    await prisma.instructor.create({
      data: {
        email: 'instructor@lti.com',
        name: 'Test Instructor',
        min: 3,
        max: 10,
      },
    });

    const instructor = await prisma.instructor.create({
      data: {
        email: 'instructor2@lti.com',
        name: 'Test Instructor 2',
        min: 3,
        max: 10,
      },
    });
    await prisma.$transaction(
      range(10).map((i) => {
        return prisma.topic.create({
          data: {
            title: `Test Topic ${i}`,
            description: `Test Description ${i}`,
            type: ['normal', 'tdk', 'research', 'internship'][i % 4],
            instructorId: instructor.id,
            capacity: 5,
          },
        });
      }),
    );

    await prisma.$transaction(
      range(10).map((i) => {
        return prisma.course.create({
          data: {
            code: `Test Course ${i}`,
            name: `Test Course ${i}`,
            credit: 5,
          },
        });
      }),
    );
  } catch (error) {
    console.error(error);
  }
}

main();
