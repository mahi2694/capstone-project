# Conduit – Playwright + TypeScript automation framework

End-to-end UI tests for the **Conduit (RealWorld)** demo app hosted by Bondar Academy: <https://conduit.bondaracademy.com>

Scenarios covered

| Spec | What it tests |
| --- | --- |
| `tests/register.spec.ts` | Manual sign-up through the UI, duplicate-email rejection, empty form |
| `tests/login.spec.ts` | Login of a registered user, unknown email error, wrong password error |
| `tests/articles.spec.ts` | **Data-driven** add article (one test per row of `test-data/articles.json`), edit article, delete article |

> The original brief targeted practicesoftwaretesting.com, which proved too slow and flaky. I also tried the fly.dev
> Conduit host, which rate-limited (HTTP 429) after light use. The Bondar Academy instance responded quickly and
> consistently, so the framework targets it.

## Framework concepts demonstrated

* **Page Object Model** – `pages/` (`RegisterPage`, `LoginPage`, `EditorPage`, `ArticlePage`, `ProfilePage`, `NavBar`).
  Role / placeholder based locators, no `waitForTimeout`.
* **Custom fixtures** – `fixtures/testFixtures.ts` (`base.extend`) provides the page objects, the registered `user`,
  and `createArticle`, which creates an article through the UI and **deletes it again in teardown** through the API.
* **Storage-state authentication** – `tests/auth.setup.ts` registers a brand-new user through the UI, asserts the
  signed-in header, then saves `playwright/.auth/user.json` (browser state) and `playwright/.auth/credentials.json`
  (the user's credentials, used by the login tests). The `chromium` / `firefox` projects depend on `setup` and reuse the state.
* **Data-driven tests** – `test-data/*.json` validated at load time by `utils/testData.ts`; each article row generates a
  separately named test.
* **Parallel safety** – every user and article title carries a unique id (`utils/users.ts`), because the site is shared.
* **Reporting** – HTML report in `reports/html`, screenshots on failure, trace on first retry, video on failure.

## Project layout

```
pages/          page objects
fixtures/       custom test fixtures
tests/          auth.setup.ts, register / login / articles specs
test-data/      articles.json, invalidLogins.json
utils/          paths, unique users, test-data loader + validation
playwright/.auth/   generated, git-ignored (storage state + credentials)
reports/html/       generated, git-ignored
```

## Setup

```bash
npm install
npx playwright install            # or: npx playwright install chromium
cp .env.example .env              # BASE_URL, API_URL and TEST_PASSWORD (no real credentials are needed)
```

## Running

```bash
npm test                                   # everything (setup runs first)
npx playwright test tests/articles.spec.ts --project=chromium
npx playwright test tests/login.spec.ts    --project=chromium-anonymous
npx playwright test tests/register.spec.ts --project=chromium-anonymous
npm run test:headed                        # headed mode
npx playwright test --workers=2            # choose the worker count
npx playwright test --retries=1            # enable retries (traces are captured on the first retry)
npm run report                             # open the HTML report
npm run typecheck
```

Spec files other than login/register are run against both Chromium and Firefox (`--project=firefox`).
The `setup` project always runs first as a dependency.


