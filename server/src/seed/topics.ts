import { parse } from 'csv-parse/sync';
import * as fs from 'fs/promises';
import { prisma } from '../db';

async function main() {
  const input = await fs.readFile('./data/topics.csv', 'utf-8');

  const parsed = parse(input, {
    encoding: 'utf-8',
    columns: true,
    bom: true,
  }) as {
    neptun: string;
    name: string;
    code: string;
    title: string;
  }[];

  // await prisma.instructor.createMany({
  //   data: parsed.map((row) => ({
  //     neptun: row.neptun,
  //     name: row.name,
  //     min: 0,
  //     max: 5,
  //   })),
  // });

  const instructors = await prisma.instructor.findMany();

  const data = parsed
    .map((row) => ({
      type: 'research',
      title: row.title,
      capacity: 1,
      description: 'asd',
      instructorId: instructors.find((i) => i.neptun === row.neptun)?.id ?? 1,
    }))
    .filter((t) => t.instructorId);

  await prisma.topic.createMany({
    data,
  });
}

main();
