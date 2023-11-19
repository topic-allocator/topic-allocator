import { prisma } from '../db';
import * as fs from 'fs/promises';

async function main() {
  await clearDatabase();
  await loadInstructors();
  await loadTopics();
  await loadStudents();
  await loadCourses();
  await loadStudentCourseCompletions();
  await loadStudentTopicPreferences();
  await loadSpecialAllocations();
}

async function loadInstructors() {
  const instructorRows = await readToRows(`${__dirname}/data/instructor.csv`);

  const data = instructorRows.map((line) => {
    const [id, name, min, max] = line.split(';');
    const email = `${name.toLowerCase().replace(' ', '')}@lti.com`;
    if (parseInt(min) > parseInt(max)) {
      console.error(`Instructor ${name} has min > max`);
    }
    return { id, name, email, min: parseInt(min), max: parseInt(max) };
  });

  return prisma.instructor.createMany({
    data,
  });
}

async function loadTopics() {
  const topicRows = await readToRows(`${__dirname}/data/topic.csv`);
  const data = topicRows.map((line) => {
    const [id, title, capacity, instructorId] = line.split(';');
    return {
      id,
      title,
      description: title,
      type: 'normal',
      capacity: parseInt(capacity),
      instructorId,
    };
  });

  return prisma.topic.createMany({
    data,
  });
}

async function loadStudents() {
  const studentRows = await readToRows(`${__dirname}/data/student.csv`);
  const data = studentRows.map((line) => {
    const [id, name] = line.split(';');
    const email = `${name.toLowerCase().replace(' ', '')}@lti.com`;
    return { id, name, email };
  });

  return prisma.student.createMany({
    data,
  });
}

async function loadCourses() {
  const courseRows = await readToRows(`${__dirname}/data/course.csv`);
  const data = courseRows.map((line) => {
    const [id, code, name, credit] = line.split(';');
    return { id, code, name, credit: parseInt(credit) };
  });

  return prisma.course.createMany({
    data,
  });
}

async function loadStudentCourseCompletions() {
  const courseCompletionRows = await readToRows(
    `${__dirname}/data/student-course-completion.csv`,
  );
  const data = courseCompletionRows.map((line) => {
    const [studentId, grade] = line.split(';');
    return { studentId, grade };
  });

  return prisma.studentCourseCompletion.createMany({
    data: data.map(({ studentId, grade }) => ({
      studentId: studentId,
      grade: parseFloat(grade),
      courseId: 'dummy-course',
    })),
  });
}

async function loadStudentTopicPreferences() {
  const topicPreferenceRows = await readToRows(
    `${__dirname}/data/student-topic-preference.csv`,
  );
  const input = topicPreferenceRows.map((line) => {
    const [studentId, ...preferences] = line.split(';');
    return { studentId, preferences };
  });

  const data = input.flatMap(({ studentId, preferences }) =>
    preferences.map((topicId, index) => ({
      studentId,
      topicId,
      rank: index + 1,
    })),
  );

  return prisma.studentTopicPreference.createMany({
    data,
  });
}

async function loadSpecialAllocations() {
  const specialAllocationRows = await readToRows(
    `${__dirname}/data/special-allocation.csv`,
  );
  const data = specialAllocationRows.map((line) => {
    const [studentId, type, instructorName] = line.split(';');
    return { studentId, type, instructorName };
  });

  return Promise.all(
    data.map(async ({ studentId, type, instructorName }) => {
      const instructor = await prisma.instructor.findFirst({
        where: {
          name: instructorName,
        },
      });

      if (!instructor) {
        console.error(`Instructor ${instructorName} not found`);
        return;
      }

      const newTopic = await prisma.topic.create({
        data: {
          title: `${instructorName} - ${studentId} - ${type}`,
          description: `${instructorName} - ${type}`,
          type,
          capacity: 1,
          instructorId: instructor.id,
        },
      });

      return prisma.student.update({
        where: {
          id: studentId,
        },
        data: {
          assignedTopicId: newTopic.id,
        },
      });
    }),
  );
}

async function clearDatabase() {
  return prisma.$transaction([
    prisma.studentTopicPreference.deleteMany(),
    prisma.studentCourseCompletion.deleteMany(),
    prisma.topicCoursePreference.deleteMany(),
    prisma.topic.deleteMany(),
    prisma.course.deleteMany(),
    prisma.student.deleteMany(),
    prisma.instructor.deleteMany(),
  ]);
}

async function readToRows(filePath: string) {
  const file = await fs.readFile(filePath);
  return file.toString().split('\n').slice(1, -1);
}

main();
