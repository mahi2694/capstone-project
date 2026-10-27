import { type Locator, type Page, expect } from '@playwright/test';
import type { TestUser } from '../utils/users';

export class RegisterPage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly errors: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByPlaceholder('Username');
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('Password');
    this.signUpButton = page.getByRole('button', { name: 'Sign up' });
    this.errors = page.locator('ul.error-messages li');
  }

  async goto(): Promise<void> {
    await this.page.goto('/register', { waitUntil: 'domcontentloaded' });
    await expect(this.signUpButton).toBeVisible();
  }

  async register(user: TestUser): Promise<void> {
    await this.nameInput.fill(user.username);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.signUpButton.click();
  }
}
