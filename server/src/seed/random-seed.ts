import { db } from '../db';
import { range } from '../lib/utils';

async function clearDatabase() {
  return db.$transaction([
    db.studentTopicPreference.deleteMany(),
    db.studentCourseCompletion.deleteMany(),
    db.topicCoursePreference.deleteMany(),
    db.topic.deleteMany(),
    db.course.deleteMany(),
    db.student.deleteMany(),
    db.instructor.deleteMany(),
  ]);
}

async function createStudentTopicPreferences() {
  const topics = await db.topic.findMany();
  const students = await db.student.findMany();

  const data = students.flatMap((student) => {
    const numberOfPreferences = Math.floor(Math.random() * 5) + 10;
    const topicIds = topics.map((topic) => topic.id);
    return range(numberOfPreferences).map((i) => {
      const selectedTopicId =
        topicIds[Math.floor(Math.random() * topicIds.length)];
      topicIds.splice(topicIds.indexOf(selectedTopicId), 1);

      return {
        studentId: student.id,
        topicId: selectedTopicId,
        rank: i + 1,
      };
    });
  });

  return db.studentTopicPreference.createMany({
    data,
  });
}

async function createTopicCoursePreferences() {
  const courses = await db.course.findMany();
  const topics = await db.topic.findMany();

  const data = topics.flatMap((topic) => {
    const numberOfPreferences = Math.floor(Math.random() * 7);
    const courseIds = courses.map((course) => course.id);
    return range(numberOfPreferences).map(() => {
      const selectedCourseId =
        courseIds[Math.floor(Math.random() * courseIds.length)];
      courseIds.splice(courseIds.indexOf(selectedCourseId), 1);
      return {
        topicId: topic.id,
        courseId: selectedCourseId,
        weight: Math.random() * 5,
      };
    });
  });

  return db.topicCoursePreference.createMany({
    data,
  });
}

async function createStudentCourseCompletions() {
  const courses = await db.course.findMany();
  const students = await db.student.findMany();

  const data = students.flatMap((student) => {
    const numberOfCompletions = Math.floor(Math.random() * 5) + 30;
    const courseIds = courses.map((course) => course.id);
    return range(numberOfCompletions).map(() => {
      const selectedCourseId =
        courseIds[Math.floor(Math.random() * courseIds.length)];
      courseIds.splice(courseIds.indexOf(selectedCourseId), 1);
      return {
        studentId: student.id,
        courseId: selectedCourseId,
        grade: Math.floor(Math.random() * 5) + 1,
      };
    });
  });

  return db.studentCourseCompletion.createMany({
    data,
  });
}

async function main() {
  await clearDatabase();

  // Create special 'users'
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

  await db.instructor.create({
    data: {
      id: 'test-instructor2',
      email: 'admin@lti.com',
      name: 'Test Admin',
      min: 3,
      max: 10,
      isAdmin: true,
    },
  });

  // Create instructors
  await db.instructor.createMany({
    data: range(30).map((i) => ({
      name: `Instructor ${i}`,
      email: `INSTRUCTOR-${i}@lti.com`,
      min: 3,
      max: Math.floor(Math.random() * 10) + 3,
    })),
  });

  // Create students
  await db.student.createMany({
    data: range(150).map((i) => ({
      name: `Student ${i}`,
      email: `STUDENT-${i}@lti.com`,
    })),
  });

  // Create topics
  const instructors = await db.instructor.findMany();
  await Promise.all(
    instructors.map((instructor) => {
      return db.topic.createMany({
        data: range(3).map((i) => ({
          title: `Topic ${i}`,
          instructorId: instructor.id,
          type: 'normal',
          capacity: Math.floor(Math.random() * 10) + 1,
          language: ['en', 'hu'][Math.floor(Math.random() * 2)],
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl vitae aliquam ultricies, nunc nunc aliquet nunc, vitae aliquam nun',
        })),
      });
    }),
  );

  await createStudentTopicPreferences();

  // Create courses
  await db.course.createMany({
    data: range(40).map((i) => ({
      code: `COURSE-${i}`,
      name: `Course ${i}`,
      credit: Math.floor(Math.random() * 5) + 3,
    })),
  });
  await createTopicCoursePreferences();
  await createStudentCourseCompletions();
}

main();
