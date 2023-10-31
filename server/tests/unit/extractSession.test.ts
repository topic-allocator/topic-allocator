import { HttpRequest } from '@azure/functions';
import { extractSession } from '../../src/lib/utils';
import { describe, test, expect, beforeEach } from 'vitest';

describe('testing extractSession', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'jwt_secret';
  });

  test('fail on missing Cookie field', () => {
    const httpRequest = new HttpRequest({
      url: 'https://testingisfun.com',
      method: 'GET',
    });
    expect(() => extractSession(httpRequest)).toThrowError();
  });

  test('pass on valid jwt token', () => {
    const httpRequest = new HttpRequest({
      url: 'https://testingisfun.com',
      method: 'GET',
      headers: {
        Cookie:
          'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsIm5hbWUiOiJKw6Fub3MgS3Vsa2EiLCJsb2NhbGUiOiJlbiIsImlzQWRtaW4iOmZhbHNlLCJpc0luc3RydWN0b3IiOmZhbHNlLCJpc1N0dWRlbnQiOnRydWUsImlhdCI6MTY5NTEzNTk3NH0.92oZGpR4cmEgAiAkiIk7UZSN3-FUZPGsrFtbIO_tQB0',
      },
    });

    expect(extractSession(httpRequest)).toEqual({
      iat: 1695135974,
      isAdmin: false,
      isInstructor: false,
      isStudent: true,
      locale: 'en',
      name: 'János Kulka',
      userId: 4,
    });
  });

  test('fail on invalid jwt token', () => {
    const httpRequest = new HttpRequest({
      url: 'https://testingisfun.com',
      method: 'GET',
      headers: {
        Cookie: 'jwt=invalid',
      },
    });

    expect(() => extractSession(httpRequest)).toThrowError();
  });
});
