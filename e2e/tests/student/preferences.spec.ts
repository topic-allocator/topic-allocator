import { test, expect } from '@playwright/test';
import { studentJWT } from '../helpers';

test.describe.configure({
  mode: 'serial',
});

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: 'jwt',
      value: studentJWT,
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: true,
    },
  ]);
});

test('preference list initially empty', async ({ page }) => {
  await page.goto('/app/preferences');
  await expect(page.getByText('No records found')).toBeVisible();
});

test('warning visible', async ({ page }) => {
  await page.goto('/app/preferences');
  await expect(
    page.getByText('At least 10 preferences are required'),
  ).toBeVisible();
});

test('add preference', async ({ page }) => {
  await page.goto('/app/topic-list');

  await page
    .locator('div')
    .filter({ hasText: /^Instructor:All$/ })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'Test Instructor 2' }).click();

  const response = page.waitForResponse((resp) =>
    resp.url().includes('/api/student/topic-preference'),
  );
  await page
    .getByRole('row', {
      name: 'Test Topic 0 Test Instructor 2 Normal Test Description 0 add to preferences',
    })
    .getByTitle('add to preferences')
    .click();
  await response;

  await expect(
    page.getByRole('button', { name: 'remove from preferences' }),
  ).toBeVisible();

  await page.goto('/app/preferences');

  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByRole('cell', { name: '1' })).toBeVisible();
  await expect(page.locator('tbody tr').first()).toHaveText(
    'Test Topic 0Rank: 1Description: Test Description 0Type: NormalInstructor: Test Instructor 2Move upMove down',
  );
});

test('remove preference', async ({ page }) => {
  await page.goto('/app/topic-list');

  await page
    .locator('div')
    .filter({ hasText: /^Instructor:All$/ })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'Test Instructor 2' }).click();

  const response = page.waitForResponse((resp) =>
    resp.url().includes('/api/student/topic-preference'),
  );
  await page.getByRole('button', { name: 'remove from preferences' }).click();
  await response;

  await page.goto('/app/preferences');

  await expect(page.getByText('No records found')).toBeVisible();
  await expect(
    page.getByText('At least 10 preferences are required'),
  ).toBeVisible();
});

test('add 10 preferences', async ({ page }) => {
  await page.goto('/app/topic-list');

  await page
    .locator('div')
    .filter({ hasText: /^Instructor:All$/ })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'Test Instructor 2' }).click();

  for (let i = 0; i < 10; i++) {
    const response = page.waitForResponse((resp) =>
      resp.url().includes('/api/student/topic-preference'),
    );

    await page
      .locator('tbody tr')
      .nth(i)
      .getByTitle('add to preferences')
      .click();

    await response;
  }

  await page.goto('/app/preferences');

  await expect(page.locator('tbody tr')).toHaveCount(10);
  await expect(
    page.getByText('At least 10 preferences are required'),
  ).not.toBeVisible();

  for (let i = 0; i < 10; i++) {
    await expect(
      page.locator('tbody tr').nth(i).locator('td').nth(1),
    ).toContainText((i + 1).toString());
  }

  await expect(page.getByText('Saved')).toBeVisible();
});

test('move preferences up and down', async ({ page }) => {
  await page.goto('/app/preferences');

  await page
    .getByRole('row', {
      name: 'Test Topic 0 1 Test Description 0 Normal Test Instructor 2',
    })
    .getByRole('button')
    .click();

  await expect(page.getByText('Save')).toBeVisible();

  await expect(
    page.locator('tbody tr').first().locator('td').first(),
  ).toHaveText('Test Topic 1');
  await expect(
    page.locator('tbody tr').nth(1).locator('td').first(),
  ).toHaveText('Test Topic 0');

  await page.getByRole('button', { name: 'Save' }).click({ noWaitAfter: true });

  await page.reload();

  await expect(page.getByText('Saved')).toBeVisible();

  await expect(
    page.locator('tbody tr').first().locator('td').first(),
  ).toHaveText('Test Topic 1');
  await expect(
    page.locator('tbody tr').nth(1).locator('td').first(),
  ).toHaveText('Test Topic 0');

  await page
    .getByRole('row', {
      name: 'Test Topic 0 2 Test Description 0 Normal Test Instructor 2',
    })
    .getByRole('button')
    .first()
    .click();

  await expect(
    page.locator('tbody tr').first().locator('td').first(),
  ).toHaveText('Test Topic 0');
  await expect(
    page.locator('tbody tr').nth(1).locator('td').first(),
  ).toHaveText('Test Topic 1');

  await page.getByRole('button', { name: 'Save' }).click({ noWaitAfter: true });

  await page.reload();

  await expect(page.getByText('Saved')).toBeVisible();

  await expect(
    page.locator('tbody tr').first().locator('td').first(),
  ).toHaveText('Test Topic 0');
  await expect(
    page.locator('tbody tr').nth(1).locator('td').first(),
  ).toHaveText('Test Topic 1');
});

test('clear preferences', async ({ page }) => {
  await page.goto('/app/preferences');
  await expect(page.locator('tbody tr')).toHaveCount(10);

  await page.goto('/app/topic-list');

  const response = page.waitForResponse((resp) =>
    resp.url().includes('/api/student/topic-preference'),
  );
  await page
    .locator('tbody tr')
    .getByTitle('remove from preferences')
    .first()
    .click();
  await response;

  await page.goto('/app/preferences');

  await expect(
    page.getByText('At least 10 preferences are required'),
  ).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(9);

  await page.goto('/app/topic-list');

  for (let i = 1; i < 10; i++) {
    const response = page.waitForResponse((resp) =>
      resp.url().includes('/api/student/topic-preference'),
    );
    await page
      .locator('tbody tr')
      .nth(i)
      .getByTitle('remove from preferences')
      .click();
    await response;
  }

  await page.goto('/app/preferences');

  await expect(
    page.getByText('At least 10 preferences are required'),
  ).toBeVisible();
  await expect(page.getByText('No records found')).toBeVisible();
});
