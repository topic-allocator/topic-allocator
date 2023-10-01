import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { checkForLtiFields, checkOauthSignature, Session } from '../lib';
import { sign } from 'jsonwebtoken';
import { prisma } from '../db';
import { Instructor, Student } from '@prisma/client';

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

  const neptun = formData.get('ext_user_username')!.toString();
  const isAdmin = formData.get('roles')!.toString().includes('Administrator');
  const isInstructor = formData.get('roles')!.toString().includes('Instructor');
  const isStudent = !isAdmin && !isInstructor;

  let userData: Student | Instructor | null;
  try {
    if (isInstructor) {
      userData = await prisma.instructor.findUnique({
        where: {
          neptun,
        },
      });
    } else {
      userData = await prisma.student.findUnique({
        where: {
          neptun,
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
    locale: formData.get('launch_presentation_locale')!.toString() as
      | 'hu'
      | 'en',
    isAdmin,
    isInstructor,
    isStudent,
  };
  const jwt = sign(
    token satisfies Omit<Session, 'iat'>,
    process.env.JWT_SECRET!,
  );

  if (process.env.DEV) {
    console.log({ jwt });
    return {
      status: 301,
      headers: {
        location: 'http://localhost:5173/app',
        // 'jwt' cookie must be set manually during development
      },
    };
  }

  return {
    status: 301,
    headers: {
      location: '/app',
      'Set-Cookie': `jwt=${jwt}; Path=/; HttpOnly; Secure; SameSite=None;`,
    },
  };
}
