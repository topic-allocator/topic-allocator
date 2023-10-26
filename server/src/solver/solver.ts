import { spawn } from 'child_process';
import { buildSolverInput } from '../lib';
import { prisma } from '../db';

async function main() {
  const students = await prisma.student.findMany({
    select: {
      id: true,
      studentTopicPreferences: true,
      studentCourseCompletions: true,
    },
  });
  const topics = await prisma.topic.findMany({
    select: {
      id: true,
      capacity: true,
      topicCoursePreferences: true,
      instructorId: true,
    },
  });
  const instructors = await prisma.instructor.findMany({
    select: {
      id: true,
      min: true,
      max: true,
    },
  });

  const input = buildSolverInput(students, topics, instructors);

  // Rust
  // const result = solve(JSON.stringify(input));
  // console.log(result);

  // Python
  const solver = spawn('python3', [__dirname + '/solver.py']);
  solver.stdin.write(JSON.stringify(input));
  solver.stdin.end();

  solver.stdout.on('data', async (data: Buffer) => {
    if (data.toString().startsWith('result: ')) {
      const result: string[] = JSON.parse(data.toString().split('result: ')[1]);

      await prisma.student.updateMany({
        data: {
          assignedTopicId: null,
        },
      });
      await prisma.$transaction(
        result.map((r) => {
          const [studentId, topicId] = r.split('_');

          return prisma.student.update({
            data: {
              assignedTopicId: parseInt(topicId),
            },
            where: {
              id: parseInt(studentId),
            },
          });
        }),
      );
    } else {
      console.log(data.toString());
    }
  });
}

main();
