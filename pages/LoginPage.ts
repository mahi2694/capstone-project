import { type Locator, type Page, expect } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errors: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Sign in' });
    this.errors = page.locator('ul.error-messages li');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(this.loginButton).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
