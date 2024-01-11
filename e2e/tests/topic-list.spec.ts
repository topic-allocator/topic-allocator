import { test, expect } from '@playwright/test';
import { instructorJWT } from './helpers';

test.beforeEach(async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'jwt',
      value: instructorJWT,
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: true,
    },
  ]);

  await page.goto('http://localhost:7071/app/topic-list');
});

test('filter bar initially empty', async ({ page }) => {
  await expect(page.getByPlaceholder('Title...')).toBeVisible();
  await expect(page.getByPlaceholder('Title...')).toBeEmpty();
  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Instructor:All$/ })
      .getByRole('button'),
  ).toBeVisible();
  await expect(page.locator('#type')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Clear filters' }),
  ).toBeDisabled();
});

test('clear filters button', async ({ page }) => {
  await page.getByPlaceholder('Title...').fill('test');
  await page
    .locator('div')
    .filter({ hasText: /^Language:All$/ })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'hu', exact: true }).click();
  await page
    .locator('div')
    .filter({ hasText: /^Instructor:All$/ })
    .getByRole('button')
    .click();
  await page
    .getByRole('button', { name: 'Test Instructor', exact: true })
    .click();
  await page.getByRole('button', { name: 'All' }).click();
  await page.getByRole('button', { name: 'TDK' }).click();

  await expect(
    page.getByRole('button', { name: 'Clear filters' }),
  ).not.toBeDisabled();

  await page.getByRole('button', { name: 'Clear filters' }).click();

  await expect(page.getByPlaceholder('Title...')).toBeEmpty();
  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Instructor:All$/ })
      .getByRole('button'),
  ).toBeVisible();
  await expect(page.locator('#type')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Clear filters' }),
  ).toBeDisabled();
});

test('filter', async ({ page }) => {
  await page
    .locator('div')
    .filter({ hasText: /^Instructor:All$/ })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'Test Instructor 2' }).click();
  await page
    .locator('div')
    .filter({ hasText: /^Language:All$/ })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'hu', exact: true }).click();

  await expect(page.locator('tbody tr')).toHaveCount(9);
  await expect(
    page.locator('tbody tr').filter({ hasText: 'Test Instructor 2' }),
  ).toHaveCount(9);

  await page.getByRole('button', { name: 'All' }).click();
  await page.getByRole('button', { name: 'Research' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await expect(
    page.locator('tbody tr').filter({ hasText: 'Research' }),
  ).toHaveCount(2);

  await page.getByPlaceholder('Title...').fill('2');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(
    page.locator('tbody tr').filter({ hasText: 'Test Topic 2' }),
  ).toHaveCount(1);
});

test('sort', async ({ page }) => {
  await page
    .locator('div')
    .filter({ hasText: /^Instructor:All$/ })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'Test Instructor 2' }).click();

  for (let i = 0; i < 10; i++) {
    await expect(page.locator('tbody tr').nth(i)).toContainText(
      `Test Topic ${i}`,
    );
  }

  await page.getByRole('cell', { name: 'Title' }).click();
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('tbody tr').nth(9 - i)).toContainText(
      `Test Topic ${i}`,
    );
  }

  await page.getByRole('cell', { name: 'Language' }).click();
  await expect(page.locator('tbody tr').nth(0)).toContainText('en');
  for (let i = 1; i < 10; i++) {
    await expect(page.locator('tbody tr').nth(i)).toContainText('hu');
  }

  await page.getByRole('cell', { name: 'Language' }).click();
  for (let i = 0; i < 9; i++) {
    await expect(page.locator('tbody tr').nth(i)).toContainText('hu');
  }
  await expect(page.locator('tbody tr').nth(9)).toContainText('en');

  await page.getByRole('cell', { name: 'Type' }).click();
  await expect(page.locator('tbody tr').nth(0)).toContainText('Internship');
  await expect(page.locator('tbody tr').nth(1)).toContainText('Internship');
  await expect(page.locator('tbody tr').nth(2)).toContainText('Normal');
  await expect(page.locator('tbody tr').nth(3)).toContainText('Normal');
  await expect(page.locator('tbody tr').nth(4)).toContainText('Normal');
  await expect(page.locator('tbody tr').nth(5)).toContainText('Research');
  await expect(page.locator('tbody tr').nth(6)).toContainText('Research');
  await expect(page.locator('tbody tr').nth(7)).toContainText('TDK');
  await expect(page.locator('tbody tr').nth(8)).toContainText('TDK');
  await expect(page.locator('tbody tr').nth(9)).toContainText('TDK');

  await page.getByRole('cell', { name: 'Type' }).click();
  await expect(page.locator('tbody tr').nth(9)).toContainText('Internship');
  await expect(page.locator('tbody tr').nth(8)).toContainText('Internship');
  await expect(page.locator('tbody tr').nth(7)).toContainText('Normal');
  await expect(page.locator('tbody tr').nth(6)).toContainText('Normal');
  await expect(page.locator('tbody tr').nth(5)).toContainText('Normal');
  await expect(page.locator('tbody tr').nth(4)).toContainText('Research');
  await expect(page.locator('tbody tr').nth(3)).toContainText('Research');
  await expect(page.locator('tbody tr').nth(2)).toContainText('TDK');
  await expect(page.locator('tbody tr').nth(1)).toContainText('TDK');
  await expect(page.locator('tbody tr').nth(0)).toContainText('TDK');

  await page.getByRole('cell', { name: 'Description', exact: true }).click();
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('tbody tr').nth(i)).toContainText(
      `Test Description ${i}`,
    );
  }

  await page.getByRole('cell', { name: 'Description', exact: true }).click();
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('tbody tr').nth(9 - i)).toContainText(
      `Test Description ${i}`,
    );
  }
});
