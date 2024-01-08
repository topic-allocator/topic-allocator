import {
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';
import {
  checkForLtiFields,
  checkOauthSignature,
  type Session,
} from '../lib/utils';
import { sign } from 'jsonwebtoken';
import { prisma } from '../db';
import type { Instructor, Student } from '@prisma/client';
import { Locale, localeOptions } from '../labels';

export async function launchLTI(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const { method, url } = request;
  const formData = await request.formData();

  const isValid =
    //@ts-ignore: FormData type is acting funny
    checkForLtiFields(formData) && checkOauthSignature(method, url, formData);

  if (!isValid) {
    context.warn('Invalid LTI request');

    return {
      status: 401,
      body: 'Invalid LTI request',
    };
  }

  const email = formData.get('lis_person_contact_email_primary')!.toString();
  const isInstructor = formData.get('roles')!.toString().includes('Instructor');
  const isStudent = !isInstructor;

  let userData: Student | Instructor | null;
  try {
    if (isInstructor) {
      userData = await prisma.instructor.findUnique({
        where: {
          email,
        },
      });
    } else {
      userData = await prisma.student.findUnique({
        where: {
          email,
        },
      });
    }
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }

  if (!userData) {
    context.warn('User not found');

    return {
      status: 401,
      body: 'User not found',
    };
  }

  const token = {
    userId: userData.id,
    name: formData.get('lis_person_name_full')!.toString(),
    isAdmin: (userData as Instructor).isAdmin ?? false,
    isInstructor,
    isStudent,
  };
  const jwt = sign(
    token satisfies Omit<Session, 'iat'>,
    process.env.JWT_SECRET!,
  );

  const localeField = formData.get('launch_presentation_locale')?.toString();
  const locale = (
    localeOptions.includes(localeField as Locale) ? localeField : 'en'
  ) as string;

  if (process.env.DEV) {
    console.log({ jwt });
    return {
      status: 301,
      headers: {
        location: 'http://localhost:5173/app',
        'Set-Cookie': `locale=${locale}; Path=/;`,
        // 'jwt' cookie must be set manually during development
      },
    };
  }

  return {
    status: 301,
    headers: {
      location: '/app',
    },
    cookies: [
      {
        name: 'locale',
        value: locale,
        path: '/',
      },
      {
        name: 'jwt',
        value: jwt,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      },
    ],
  };
}
