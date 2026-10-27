import fs from 'node:fs';
import { test as setup, expect } from '../fixtures/testFixtures';
import { AUTH_DIR, CREDENTIALS_FILE, STORAGE_STATE } from '../utils/paths';
import { newUser } from '../utils/users';

// The app has no seeded demo account, so the setup registers a fresh user through the UI,
// saves its credentials (for the login tests) and the signed-in browser state (for everything else).
// The session is a token in localStorage["jwtToken"], which storageState captures.
setup('register a user and save the authenticated state', async ({ registerPage, navBar, page }) => {
  const user = newUser();

  await registerPage.goto();
  await registerPage.register(user);

  await expect(page).toHaveURL(/\/$/);
  await expect(navBar.userName(user.username)).toBeVisible();
  await expect(navBar.newArticleLink).toBeVisible();

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(user, null, 2));
  await page.context().storageState({ path: STORAGE_STATE });
});
