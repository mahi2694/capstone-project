import { type Locator, type Page, expect } from '@playwright/test';

export class ArticlePage {
  readonly heading: Locator;
  readonly editLink: Locator;
  readonly deleteButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    // The article actions are rendered both above and below the article body.
    this.editLink = page.getByRole('link', { name: 'Edit Article' }).first();
    this.deleteButton = page.getByRole('button', { name: 'Delete Article' }).first();
  }

  async goto(slug: string): Promise<void> {
    await this.page.goto(`/article/${slug}`, { waitUntil: 'domcontentloaded' });
  }

  body(text: string): Locator {
    return this.page.getByRole('paragraph').filter({ hasText: text });
  }

  tag(name: string): Locator {
    return this.page.locator('.tag-list').getByRole('listitem').filter({ hasText: name });
  }

  async openEditor(): Promise<void> {
    await this.editLink.click();
    await expect(this.page).toHaveURL(/\/editor\//);
  }

  /** Deletes the article (no confirmation dialog in this app) and waits for the API call. */
  async deleteArticle(): Promise<void> {
    const [response] = await Promise.all([
      this.page.waitForResponse((r) => r.request().method() === 'DELETE' && r.url().includes('/api/articles/')),
      this.deleteButton.click(),
    ]);
    expect(response.status()).toBe(204);
  }
}
