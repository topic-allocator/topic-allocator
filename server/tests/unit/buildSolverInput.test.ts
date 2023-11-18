import {
  Instructor,
  Student,
  StudentCourseCompletion,
  StudentTopicPreference,
  Topic,
  TopicCoursePreference,
} from '@prisma/client';
import { describe, test, expect } from 'vitest';
import { buildSolverInput } from '../../src/lib/utils';
import { Decimal } from '@prisma/client/runtime/library';

const studentsMock: (Student & {
  studentTopicPreferences: StudentTopicPreference[];
  studentCourseCompletions: StudentCourseCompletion[];
})[] = [
  {
    id: 1,
    name: '',
    email: '',
    assignedTopicId: null,
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
    email: '',
    assignedTopicId: null,
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

const instructorMock: Instructor[] = [
  {
    id: 1,
    name: '',
    email: '',
    min: 1,
    max: 3,
    isAdmin: false,
  },
];

describe('testing buildSolverInput', () => {
  test('build input', () => {
    expect(buildSolverInput(studentsMock, topicsMock, instructorMock)).toEqual({
      students: [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ],
      topics: [
        {
          id: 1,
          capacity: 1,
        },
        {
          id: 2,
          capacity: 1,
        },
      ],
      instructors: [
        {
          id: 1,
          min: 1,
          max: 3,
        },
      ],
      applications: [
        {
          topic_capacity: 1,
          grade: 4.666666666666667,
          instructor_id: 1,
          rank: 1,
          student_id: 1,
          topic_id: 1,
        },
        {
          topic_capacity: 1,
          grade: 4.333333333333333,
          instructor_id: 1,
          rank: 2,
          student_id: 1,
          topic_id: 2,
        },
        {
          topic_capacity: 1,
          grade: 4.666666666666667,
          instructor_id: 1,
          rank: 1,
          student_id: 2,
          topic_id: 2,
        },
        {
          topic_capacity: 1,
          grade: 4.5,
          instructor_id: 1,
          rank: 2,
          student_id: 2,
          topic_id: 1,
        },
      ],
    });
  });
});
