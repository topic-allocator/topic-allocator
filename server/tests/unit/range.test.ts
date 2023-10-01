import { range } from '../../src/lib';
import { describe, test, expect } from 'vitest';

describe('testing range', () => {
  test('return empty array', () => {
    expect(range()).toEqual([]);
    expect(range(0)).toEqual([]);
  });

  test('correct lenght', () => {
    expect(range(5)).toHaveLength(5);
    expect(range(5)[4]).toBe(4);
  });

  test('correct items', () => {
    range(5).forEach((item, index) => {
      expect(item).toBe(index);
    });
  });
});
