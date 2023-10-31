import { parseCookie } from '../../src/lib/parseCookie';
import { describe, test, expect } from 'vitest';

describe('testing parseCookie', () => {
  test('empty string', () => {
    expect(parseCookie('')).toEqual({});
  });

  test('valid cookie', () => {
    expect(parseCookie('jwt=valid;some=value')).toEqual({
      jwt: 'valid',
      some: 'value',
    });
  });

  test('fail on invalid delimiter', () => {
    expect(parseCookie('jwt=valid.some=value')).toEqual({
      jwt: 'valid.some=value',
    });
  });
});
