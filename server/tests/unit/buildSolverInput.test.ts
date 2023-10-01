import {
  Student,
  StudentCourseCompletion,
  StudentTopicPreference,
  Topic,
  TopicCoursePreference,
} from '@prisma/client';
import { describe, test, expect } from 'vitest';
import { buildSolverInput } from '../../src/lib';
import { Decimal } from '@prisma/client/runtime/library';

const studentsMock: (Student & {
  studentTopicPreferences: StudentTopicPreference[];
  studentCourseCompletions: StudentCourseCompletion[];
})[] = [
  {
    id: 1,
    name: '',
    neptun: '',
    studentTopicPreferences: [
      {
        studentId: 1,
        topicId: 1,
        rank: 1,
      },
      {
        studentId: 1,
        topicId: 2,
        rank: 2,
      },
    ],
    studentCourseCompletions: [
      {
        studentId: 1,
        courseId: 1,
        grade: 5,
      },
      {
        studentId: 1,
        courseId: 2,
        grade: 4,
      },
    ],
  },
  {
    id: 2,
    name: '',
    neptun: '',
    studentTopicPreferences: [
      {
        studentId: 2,
        topicId: 2,
        rank: 1,
      },
      {
        studentId: 2,
        topicId: 1,
        rank: 2,
      },
    ],
    studentCourseCompletions: [
      {
        studentId: 2,
        courseId: 1,
        grade: 4,
      },
      {
        studentId: 2,
        courseId: 3,
        grade: 5,
      },
    ],
  },
];

const topicsMock: (Topic & {
  topicCoursePreferences: TopicCoursePreference[];
})[] = [
  {
    id: 1,
    language: '',
    description: '',
    title: '',
    type: '',
    capacity: 1,
    instructorId: 1,
    topicCoursePreferences: [
      {
        topicId: 1,
        courseId: 1,
        weight: 1 as unknown as Decimal,
      },
      {
        topicId: 1,
        courseId: 2,
        weight: 0.5 as unknown as Decimal,
      },
    ],
  },
  {
    id: 2,
    language: '',
    description: '',
    title: '',
    type: '',
    capacity: 1,
    instructorId: 1,
    topicCoursePreferences: [
      {
        topicId: 2,
        courseId: 1,
        weight: 0.5 as unknown as Decimal,
      },
      {
        topicId: 2,
        courseId: 4,
        weight: 2 as unknown as Decimal,
      },
    ],
  },
];

describe('testing buildSolverInput', () => {
  test('build input', () => {
    expect(buildSolverInput(studentsMock, topicsMock)).toEqual({
      students: [
        {
          id: 1,
          preferences: [
            {
              topicId: 1,
              rank: 1,
            },
            {
              topicId: 2,
              rank: 2,
            },
          ],
        },
        {
          id: 2,
          preferences: [
            {
              topicId: 2,
              rank: 1,
            },
            {
              topicId: 1,
              rank: 2,
            },
          ],
        },
      ],
      topics: [
        {
          id: 1,
          preferences: [
            {
              studentId: 1,
              grade: 7 / 1.5,
            },
            {
              studentId: 2,
              grade: 4.5,
            },
          ],
        },
        {
          id: 2,
          preferences: [
            {
              studentId: 1,
              grade: 6.5 / 1.5,
            },
            {
              studentId: 2,
              grade: 7 / 1.5,
            },
          ],
        },
      ],
    });
  });
});
