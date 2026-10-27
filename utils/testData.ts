import articles from '../test-data/articles.json';
import invalidLogins from '../test-data/invalidLogins.json';
import { uniqueId } from './users';

export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tags: string[];
}

function validate(): void {
  if (!Array.isArray(articles) || articles.length < 2) {
    throw new Error('Invalid test data: articles.json needs at least two articles');
  }
  const titles = new Set<string>();
  for (const a of articles) {
    if (!Array.isArray(a.tags) || a.tags.length === 0 || a.tags.some((t) => t.trim() === '')) {
      throw new Error(`Invalid test data: "${a.title}" needs at least one non-empty tag`);
    }
    for (const key of ['title', 'description', 'body'] as const) {
      if (typeof a[key] !== 'string' || a[key].trim() === '') {
        throw new Error(`Invalid test data: "${a.title ?? '?'}" has an empty "${key}"`);
      }
    }
    if (titles.has(a.title)) throw new Error(`Invalid test data: duplicate title "${a.title}"`);
    titles.add(a.title);
  }
}

validate();

export const ARTICLES: ArticleData[] = articles;
export const UNKNOWN_EMAIL_LOGIN = invalidLogins.unknownEmail;
export const INVALID_LOGIN_ERROR = invalidLogins.expectedError;

/**
 * The site is shared, so every test run gets its own copy of the data with a unique title
 * (lets the tests find exactly their article in lists).
 */
export function withUniqueTitle(article: ArticleData): ArticleData {
  return { ...article, title: `${article.title} ${uniqueId()}` };
}
