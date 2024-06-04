import * as fs from 'fs/promises';
import { db } from '../db';

export async function readToRows(filePath: string) {
  const file = await fs.readFile(filePath);
  return file.toString().split('\n').slice(1, -1);
}

export async function clearDatabase() {
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
