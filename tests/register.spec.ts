import { test, expect } from '../fixtures/testFixtures';
import { newUser, registeredUser } from '../utils/users';

test.describe('Register', () => {
  test.beforeEach(async ({ registerPage }) => {
    await registerPage.goto();
  });

  test('a new user can sign up manually', async ({ registerPage, navBar, page }) => {
    const user = newUser();
    await registerPage.register(user);

    await expect(page).toHaveURL(/\/$/);
    await expect(navBar.userName(user.username)).toBeVisible();
    await expect(navBar.newArticleLink).toBeVisible();
    await expect(navBar.loginLink).toBeHidden();
    await expect(navBar.signUpLink).toBeHidden();
  });

  test('registering with an existing email is rejected', async ({ registerPage, page }) => {
    const existing = registeredUser();
    await registerPage.register({ ...newUser(), email: existing.email });

    await expect(registerPage.errors).toHaveText('email has already been taken');
    await expect(page).toHaveURL(/\/register/);
  });

  test('the Sign up button stays disabled until the form is complete', async ({ registerPage, navBar, page }) => {
    await expect(registerPage.signUpButton).toBeDisabled();

    const user = newUser();
    await registerPage.nameInput.fill(user.username);
    await registerPage.emailInput.fill(user.email);
    await expect(registerPage.signUpButton).toBeDisabled();

    await registerPage.passwordInput.fill(user.password);
    await expect(registerPage.signUpButton).toBeEnabled();
    await expect(page).toHaveURL(/\/register/);
    await expect(navBar.newArticleLink).toBeHidden();
  });
});
