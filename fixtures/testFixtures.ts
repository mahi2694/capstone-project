import fs from 'node:fs';
import { test as base, expect } from '@playwright/test';
import { NavBar } from '../pages/NavBar';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { EditorPage } from '../pages/EditorPage';
import { ArticlePage } from '../pages/ArticlePage';
import { ProfilePage } from '../pages/ProfilePage';
import { STORAGE_STATE } from '../utils/paths';
import { registeredUser, type TestUser } from '../utils/users';
import { withUniqueTitle, type ArticleData } from '../utils/testData';

type Fixtures = {
  navBar: NavBar;
  registerPage: RegisterPage;
  loginPage: LoginPage;
  editorPage: EditorPage;
  articlePage: ArticlePage;
  /** The user registered by auth.setup.ts (the one saved in the storage state). */
  user: TestUser;
  profilePage: ProfilePage;
  /** Creates an article through the UI (unique title) and deletes it again after the test. */
  createArticle: (article: ArticleData) => Promise<{ article: ArticleData; slug: string }>;
};

const API_URL = process.env.API_URL ?? 'https://conduit-api.bondaracademy.com/api';

/** The app keeps its JWT in localStorage["jwtToken"]; the API expects it as `Authorization: Token <jwt>`. */
function savedAuthHeader(): string | undefined {
  if (!fs.existsSync(STORAGE_STATE)) return undefined;
  const state = JSON.parse(fs.readFileSync(STORAGE_STATE, 'utf-8'));
  for (const origin of state.origins ?? []) {
    const entry = origin.localStorage?.find((i: { name: string }) => i.name === 'jwtToken');
    if (entry) return `Token ${entry.value}`;
  }
  return undefined;
}

export const test = base.extend<Fixtures>({
  navBar: async ({ page }, use) => use(new NavBar(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  editorPage: async ({ page }, use) => use(new EditorPage(page)),
  articlePage: async ({ page }, use) => use(new ArticlePage(page)),
  user: async ({}, use) => use(registeredUser()),
  profilePage: async ({ page, user }, use) => use(new ProfilePage(page, user.username)),

  createArticle: async ({ page, editorPage, request }, use) => {
    const slugs = new Set<string>();
    await use(async (article) => {
      const unique = withUniqueTitle(article);
      await editorPage.gotoNew();
      await editorPage.fill(unique);
      const slug = await editorPage.publish();
      slugs.add(slug);
      await expect(page).toHaveURL(new RegExp(`/article/${slug}$`));
      return { article: unique, slug };
    });

    // Teardown: remove whatever the test left behind (ignore 404 for articles the test deleted itself).
    // A test that edits the title changes the slug, so also try the slug currently in the URL.
    const current = page.url().match(/\/article\/([^/?#]+)/)?.[1];
    if (current) slugs.add(current);
    const Authorization = savedAuthHeader();
    if (!Authorization) return;
    for (const slug of slugs) {
      await request.delete(`${API_URL}/articles/${slug}`, { headers: { Authorization } }).catch(() => undefined);
    }
  },
});

export { expect };
