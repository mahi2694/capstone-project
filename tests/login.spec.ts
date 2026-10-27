import { test, expect } from '../fixtures/testFixtures';
import { INVALID_LOGIN_ERROR, UNKNOWN_EMAIL_LOGIN } from '../utils/testData';

// Runs without storage state so the login form itself is exercised.
test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('a registered user can log in', async ({ loginPage, navBar, user, page }) => {
    await loginPage.login(user.email, user.password);

    await expect(page).toHaveURL(/\/$/);
    await expect(navBar.userName(user.username)).toBeVisible();
    await expect(navBar.newArticleLink).toBeVisible();
    await expect(navBar.loginLink).toBeHidden();
  });

  test('an unknown email is rejected with an error', async ({ loginPage, navBar, page }) => {
    await loginPage.login(UNKNOWN_EMAIL_LOGIN.email, UNKNOWN_EMAIL_LOGIN.password);

    await expect(loginPage.errors).toHaveText(INVALID_LOGIN_ERROR);
    await expect(page).toHaveURL(/\/login/);
    await expect(navBar.newArticleLink).toBeHidden();
  });

  test('a wrong password for a registered user is rejected', async ({ loginPage, navBar, user, page }) => {
    await loginPage.login(user.email, `${user.password}-wrong`);

    await expect(loginPage.errors).toHaveText(INVALID_LOGIN_ERROR);
    await expect(page).toHaveURL(/\/login/);
    await expect(navBar.newArticleLink).toBeHidden();
  });
});
