import { type Locator, type Page, expect } from '@playwright/test';
import type { ArticleData } from '../utils/testData';

/** The create/edit article form (the same form and "Publish Article" button are used for both). */
export class EditorPage {
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly tagsInput: Locator;
  readonly tagPills: Locator;
  readonly publishButton: Locator;

  constructor(private readonly page: Page) {
    this.titleInput = page.getByPlaceholder('Article Title');
    this.descriptionInput = page.getByPlaceholder("What's this article about?");
    this.bodyInput = page.getByPlaceholder('Write your article (in markdown)');
    this.tagsInput = page.getByPlaceholder('Enter tags');
    this.tagPills = page.locator('.tag-list .tag-default');
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
  }

  async gotoNew(): Promise<void> {
    await this.page.goto('/editor', { waitUntil: 'domcontentloaded' });
    await expect(this.publishButton).toBeVisible();
  }

  async addTag(tag: string): Promise<void> {
    await this.tagsInput.fill(tag);
    await this.tagsInput.press('Enter');
    await expect(this.tagPills.filter({ hasText: tag })).toBeVisible();
  }

  async fill(article: ArticleData): Promise<void> {
    await this.titleInput.fill(article.title);
    await this.descriptionInput.fill(article.description);
    await this.bodyInput.fill(article.body);
    for (const tag of article.tags) await this.addTag(tag);
  }

  /** Publishes a new article and returns its slug (taken from the API response). */
  async publish(): Promise<string> {
    return this.submit('POST', 201);
  }

  /** Saves changes to an existing article and returns its (possibly new) slug. */
  async update(): Promise<string> {
    return this.submit('PUT', 200);
  }

  private async submit(method: 'POST' | 'PUT', expectedStatus: number): Promise<string> {
    const [response] = await Promise.all([
      this.page.waitForResponse((r) => r.request().method() === method && /\/api\/articles\/?[^/]*$/.test(r.url())),
      this.publishButton.click(),
    ]);
    expect(response.status()).toBe(expectedStatus);
    return (await response.json()).article.slug as string;
  }
}
