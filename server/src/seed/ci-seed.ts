import { prisma } from '../db';
import { range } from '../lib/utils';

async function main() {
  try {
    await prisma.$transaction([
      prisma.studentTopicPreference.deleteMany(),
      prisma.studentCourseCompletion.deleteMany(),
      prisma.topicCoursePreference.deleteMany(),
      prisma.topic.deleteMany(),
      prisma.course.deleteMany(),
      prisma.student.deleteMany(),
      prisma.instructor.deleteMany(),
    ]);

    await prisma.student.create({
      data: {
        id: 'test-student',
        email: 'student@lti.com',
        name: 'Test Student',
      },
    });

    await prisma.instructor.create({
      data: {
        id: 'test-instructor',
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
