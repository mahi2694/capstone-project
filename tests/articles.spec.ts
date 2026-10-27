import { test, expect } from '../fixtures/testFixtures';
import { ARTICLES, withUniqueTitle } from '../utils/testData';

test.describe('Articles', () => {
  for (const data of ARTICLES) {
    test(`add article: "${data.title}"`, async ({ articlePage, profilePage, createArticle }) => {
      const { article } = await createArticle(data);

      await expect(articlePage.heading).toHaveText(article.title);
      await expect(articlePage.body(article.body)).toBeVisible();
      for (const tag of article.tags) await expect(articlePage.tag(tag)).toBeVisible();
      await expect(articlePage.editLink).toBeVisible();

      await profilePage.goto();
      await expect(profilePage.articleWithTitle(article.title)).toHaveCount(1);
    });
  }

  test('edit an article', async ({ editorPage, articlePage, profilePage, createArticle, page }) => {
    const { article } = await createArticle(ARTICLES[0]);
    const edited = withUniqueTitle({
      ...article,
      title: 'Edited article',
      body: 'This body was changed by the edit test.',
    });

    await articlePage.openEditor();
    await expect(editorPage.titleInput).toHaveValue(article.title);
    await expect(editorPage.bodyInput).toHaveValue(article.body);
    await editorPage.titleInput.fill(edited.title);
    await editorPage.bodyInput.fill(edited.body);
    const newSlug = await editorPage.update();

    await expect(page).toHaveURL(new RegExp(`/article/${newSlug}$`));
    await expect(articlePage.heading).toHaveText(edited.title);
    await expect(articlePage.body(edited.body)).toBeVisible();
    await expect(articlePage.body(article.body)).toHaveCount(0);

    await profilePage.goto();
    await expect(profilePage.articleWithTitle(edited.title)).toHaveCount(1);
    await expect(profilePage.articleWithTitle(article.title)).toHaveCount(0);
  });

  test('delete an article', async ({ articlePage, profilePage, createArticle, page }) => {
    const { article, slug } = await createArticle(ARTICLES[1]);
    await profilePage.goto();
    await expect(profilePage.articleWithTitle(article.title)).toHaveCount(1);

    await articlePage.goto(slug);
    await expect(articlePage.heading).toHaveText(article.title);
    await articlePage.deleteArticle();

    await expect(page).toHaveURL(/\/$/);
    await profilePage.goto();
    await expect(profilePage.articleWithTitle(article.title)).toHaveCount(0);
  });
});
