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

    await prisma.topic.createMany({
      data: range(10).map((i) => ({
        title: `Test Topic ${i}`,
        description: `Test Description ${i}`,
        type: ['normal', 'tdk', 'research', 'internship'][i % 4],
        instructorId: instructor.id,
        capacity: 5,
      })),
    });

    const otherStudent = await prisma.student.create({
      data: {
        email: 'student2@lti.com',
        name: 'Test Student 2',
      },
    });
    const topics = await prisma.topic.findMany();
    await prisma.studentTopicPreference.create({
      data: {
        studentId: otherStudent.id,
        topicId: topics[0].id,
        rank: 1,
      },
    });

    await prisma.course.createMany({
      data: range(10).map((i) => ({
        code: `Test Course ${i}`,
        name: `Test Course ${i}`,
        credit: 5,
      })),
    });
  } catch (error) {
    console.error(error);
  }
}

main();
