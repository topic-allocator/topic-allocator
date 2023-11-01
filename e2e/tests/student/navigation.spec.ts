import { test, expect } from '@playwright/test';
import { studentJWT } from '../helpers';

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

test('navigation', async ({ page }) => {
  await page.goto('/app');
  await expect(page).toHaveURL(/.*\/app\/topic-list$/);

  await expect(
    page.getByRole('link', { name: 'Preference list' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Topic list' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Instructor' }),
  ).not.toBeVisible();

  await page.getByRole('link', { name: 'Preference list' }).click();
  await expect(page).toHaveURL(/.*\/app\/preferences$/);

  await page.goto('/app/instructor/own-topics');
  await expect(page).toHaveURL(/.*\/app\/topic-list$/);

  await page.goto('/app/non-existing-page');
  await expect(page).toHaveURL(/.*\/app\/topic-list$/);
});
