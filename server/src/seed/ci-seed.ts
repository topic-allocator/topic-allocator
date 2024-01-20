import { db } from '../db';
import { range } from '../lib/utils';

async function main() {
  try {
    await db.$transaction([
      db.studentTopicPreference.deleteMany(),
      db.studentCourseCompletion.deleteMany(),
      db.topicCoursePreference.deleteMany(),
      db.topic.deleteMany(),
      db.course.deleteMany(),
      db.student.deleteMany(),
      db.instructor.deleteMany(),
    ]);

    await db.student.create({
      data: {
        id: 'test-student',
        email: 'student@lti.com',
        name: 'Test Student',
      },
    });

    await db.instructor.create({
      data: {
        id: 'test-instructor',
        email: 'instructor@lti.com',
        name: 'Test Instructor',
        min: 3,
        max: 10,
      },
    });

    const instructor = await db.instructor.create({
      data: {
        email: 'instructor2@lti.com',
        name: 'Test Instructor 2',
        min: 3,
        max: 10,
      },
    });

    await db.topic.createMany({
      data: range(10).map((i) => ({
        title: `Test Topic ${i}`,
        language: i === 9 ? 'en' : 'hu',
        description: `Test Description ${i}`,
        type: ['normal', 'tdk', 'research', 'internship'][i % 4],
        instructorId: instructor.id,
        capacity: 5,
      })),
    });

    const otherStudent = await db.student.create({
      data: {
        email: 'student2@lti.com',
        name: 'Test Student 2',
      },
    });
    const topics = await db.topic.findMany();
    await db.studentTopicPreference.create({
      data: {
        studentId: otherStudent.id,
        topicId: topics[0].id,
        rank: 1,
      },
    });

    await db.course.createMany({
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
