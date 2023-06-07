import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { Instructor } from '@prisma/client';
import { prisma } from '../../db';
import { getSession } from '../../utils';

export type InstructorResponse = Pick<Instructor, 'id' | 'name'>;
export async function getInstructors(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  // TODO: admin only
  const session = getSession(request);
  if (!session) {
    context.warn('Invalid session');
    return {
      status: 401,
    };
  }

  try {
    const topics = await prisma.instructor.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return {
      jsonBody: [...topics] satisfies InstructorResponse[],
    };
  } catch (error) {
    context.error(error);

    return {
      status: 500,
    };
  }
}
