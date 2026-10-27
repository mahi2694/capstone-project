import { type Locator, type Page } from '@playwright/test';

export class NavBar {
  readonly newArticleLink: Locator;
  readonly loginLink: Locator;
  readonly signUpLink: Locator;

  constructor(private readonly page: Page) {
    // The page has a second <nav> (pagination), so target the header bar explicitly.
    const nav = page.locator('nav.navbar');
    this.newArticleLink = nav.getByRole('link', { name: 'New Article' });
    this.loginLink = nav.getByRole('link', { name: 'Sign in' });
    this.signUpLink = nav.getByRole('link', { name: 'Sign up' });
  }

  /** The signed-in user's name shown in the header. */
  userName(username: string): Locator {
    return this.page.locator('nav.navbar').getByRole('link', { name: username, exact: true });
  }
}
