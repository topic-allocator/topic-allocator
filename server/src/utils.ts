import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createHmac } from 'node:crypto';
import { verify } from 'jsonwebtoken';
import { z } from 'zod';
import { Instructor, Student } from '@prisma/client';
import { prisma } from './db';

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

export function checkOauthSignature(method: string, url: string, params: FormData): boolean {
  const oauthSignature = params.get('oauth_signature');
  params.delete('oauth_signature');

  const launchParams = Array.from(params)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
    .join('&');

  const stringToSign = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(launchParams)
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

export function withSession(
  handler: (
    request: HttpRequest,
    context: InvocationContext,
    session: Session,
  ) => Promise<HttpResponseInit>,
) {
  return (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const session = extractSession(request);
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

function extractSession(request: HttpRequest): Session | undefined {
  const cookieString = request.headers.get('Cookie');
  if (!cookieString) {
    return;
  }

  const { jwt } = parseCookie(cookieString);

  try {
    return verify(jwt, process.env.JWT_SECRET!) as Session;
  } catch (error) {
    console.error(error);
    return;
  }
}

function parseCookie(cookieString: string): Record<string, string> {
  const keyValuePairs = cookieString.split(';').map((cookie) => cookie.split('='));

  const parsedCookie = keyValuePairs.reduce<Record<string, string>>(function (obj, cookie) {
    obj[decodeURIComponent(cookie[0].trim())] = decodeURIComponent(cookie[1].trim());

    return obj;
  }, {});

  return parsedCookie;
}

export async function checkForExistingUser(session: Session): Promise<Instructor | Student | null> {
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
