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
          'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LWluc3RydWN0b3IyIiwibmFtZSI6IkFkbWluIFVzZXIiLCJpc0FkbWluIjp0cnVlLCJpc0luc3RydWN0b3IiOnRydWUsImlzU3R1ZGVudCI6ZmFsc2UsImlhdCI6MTcwMDQwMzUyNX0.PJ7QpUxc5TEeo4RDEzA3koq6cSeUdGJtd7kLj5mINZA',
      },
    });

    expect(extractSession(httpRequest)).toEqual({
      userId: 'test-instructor2',
      name: 'Admin User',
      isAdmin: true,
      isInstructor: true,
      isStudent: false,
      iat: 1700403525,
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
