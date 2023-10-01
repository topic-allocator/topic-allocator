import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { createHmac } from 'node:crypto';
import { verify } from 'jsonwebtoken';
import { z } from 'zod';
import {
  Instructor,
  Student,
  StudentCourseCompletion,
  StudentTopicPreference,
  Topic,
  TopicCoursePreference,
} from '@prisma/client';
import { prisma } from './db';

export function range(len?: number): number[] {
  if (!len) {
    return [];
  }

  return [...Array(len).keys()];
}

// TODO: maybe use Zod for this
export function checkForLtiFields(params: FormData): boolean {
  let hasNeccessaryFields = true;

  const requiredFields = [
    'lti_message_type',
    'lti_version',
    'resource_link_id',
    'roles',
    'lis_person_contact_email_primary',
    'lis_person_name_full',
    'ext_user_username',
    'launch_presentation_locale',

    'oauth_consumer_key',
    'oauth_signature_method',
    'oauth_timestamp',
    'oauth_nonce',
    'oauth_version',
    'oauth_signature',
    'oauth_callback',
  ];

  requiredFields.forEach((field) => {
    if (!params.has(field)) {
      hasNeccessaryFields = false;
    }
  });

  return hasNeccessaryFields;
}

export function checkOauthSignature(
  method: string,
  url: string,
  params: FormData,
): boolean {
  const oauthSignature = params.get('oauth_signature');

  params.delete('oauth_signature');

  const launchParams = Array.from(params)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`,
    )
    .join('&');

  const stringToSign = `${method}&${encodeURIComponent(
    url,
  )}&${encodeURIComponent(launchParams)
    // parentheses must be manually double encoded
    .replace(/\(/g, '%2528')
    .replace(/\)/g, '%2529')}`;

  const hmac = createHmac('sha1', `${process.env.LTI_SECRET}&`);
  const signarure = hmac.update(stringToSign, 'utf8').digest('base64');

  return signarure === oauthSignature;
}

const sessionSchema = z.object({
  userId: z.number(),
  name: z.string(),
  locale: z.enum(['hu', 'en']),
  isAdmin: z.boolean(),
  isInstructor: z.boolean(),
  isStudent: z.boolean(),
  iat: z.number(),
});
export type Session = z.infer<typeof sessionSchema>;

/**
 * Wraps a httpTrigger handler function and suplies it with the session object.
 */
export function withSession(
  handler: (
    request: HttpRequest,
    context: InvocationContext,
    session: Session,
  ) => Promise<HttpResponseInit>,
) {
  return (
    request: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    let session;
    try {
      session = extractSession(request);
    } catch (error) {
      context.error(error);
      return Promise.resolve({
        status: 401,
        jsonBody: {
          message: 'INVALID_SESSION',
        },
      });
    }

    const parsedSession = sessionSchema.safeParse(session);

    if (!parsedSession.success) {
      context.warn('Invalid session');

      return Promise.resolve({
        status: 401,
        jsonBody: {
          message: 'INVALID_SESSION',
        },
      });
    }

    return handler(request, context, parsedSession.data);
  };
}

/**
 * Extracts and verifies the session from the request.
 * Reads the JWT secret from 'process.env.JWT_SECRET'.
 *
 * @throws {Error} Either if the cookie is missing or the JWT verification fails.
 */
export function extractSession(request: HttpRequest): Session | never {
  const cookieString = request.headers.get('Cookie');
  if (!cookieString) {
    throw new Error('No cookie found on request');
  }

  const { jwt } = parseCookie(cookieString);

  return verify(jwt, process.env.JWT_SECRET!) as Session;
}

export function parseCookie(cookieString: string): Record<string, string> {
  if (cookieString === '') {
    return {};
  }

  const keyValuePairs = cookieString.split(';').map((cookie) => {
    const [key, ...value] = cookie.split('=');
    return [key, value.join('=')];
  });

  const parsedCookie = keyValuePairs.reduce<Record<string, string>>(
    (obj, cookie) => {
      obj[decodeURIComponent(cookie[0].trim())] = decodeURIComponent(
        cookie[1].trim(),
      );

      return obj;
    },
    {},
  );

  return parsedCookie;
}

export async function checkForExistingUser(
  session: Session,
): Promise<Instructor | Student | null> {
  const { isInstructor, userId } = session;

  if (isInstructor) {
    return prisma.instructor.findUnique({
      where: {
        id: userId,
      },
    });
  } else {
    return prisma.student.findUnique({
      where: {
        id: userId,
      },
    });
  }
}

export function buildSolverInput(
  students: (Student & {
    studentTopicPreferences: StudentTopicPreference[];
    studentCourseCompletions: StudentCourseCompletion[];
  })[],
  topics: (Topic & {
    topicCoursePreferences: TopicCoursePreference[];
  })[],
) {
  return {
    students: students.map((student) => ({
      id: student.id,
      preferences: student.studentTopicPreferences.map((preference) => ({
        topicId: preference.topicId,
        rank: preference.rank,
      })),
    })),
    topics: topics.map((topic) => ({
      id: topic.id,
      preferences: students.map((student) => ({
        studentId: student.id,
        grade: calculateWeightedGrade(
          student.studentCourseCompletions,
          topic.topicCoursePreferences,
        ),
      })),
    })),
  };
}

function calculateWeightedGrade(
  courseCompletions: StudentCourseCompletion[],
  coursePreferences: TopicCoursePreference[],
) {
  const { sum, total } = courseCompletions.reduce(
    (acc, completion) => {
      let weight = 1;
      const preference = coursePreferences.find(
        (preference) => preference.courseId === completion.courseId,
      );
      if (preference) {
        weight = Number(preference.weight);
      }

      return {
        sum: acc.sum + completion.grade * Number(weight),
        total: acc.total + Number(weight),
      };
    },
    {
      sum: 0,
      total: 0,
    },
  );

  return sum / total;
}
