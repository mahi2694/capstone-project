import { type Locator, type Page, expect } from '@playwright/test';

export class ProfilePage {
  readonly myPostsTab: Locator;
  readonly articlePreviews: Locator;
  readonly noArticlesMessage: Locator;

  constructor(private readonly page: Page, private readonly username: string) {
    this.myPostsTab = page.getByRole('link', { name: 'My Posts' });
    this.articlePreviews = page.locator('.article-preview');
    this.noArticlesMessage = page.getByText('No articles are here... yet.');
  }

  /** Opens the profile and waits until the article list has loaded (either previews or the empty message). */
  async goto(): Promise<void> {
    await this.page.goto(`/profile/${this.username}`, { waitUntil: 'domcontentloaded' });
    await expect(this.myPostsTab).toBeVisible();
    await expect(this.noArticlesMessage.or(this.articlePreviews.first())).toBeVisible();
  }

  articleWithTitle(title: string): Locator {
    return this.articlePreviews.filter({ has: this.page.getByRole('heading', { name: title }) });
  }
}
