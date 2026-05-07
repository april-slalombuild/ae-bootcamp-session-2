# Testing Guidelines

This document defines the testing principles, conventions, and tooling for the TODO app. All new features must include appropriate tests at the right level (unit, integration, and/or E2E).

## 1. Test Types and Tooling

### Unit Tests
- **Framework**: Jest.
- **Scope**: Test individual functions and React components in isolation. Mock external dependencies (network, timers, modules).
- **Naming**: Files must use `*.test.js` or `*.test.ts`.
- **Location**:
  - **Backend**: `packages/backend/__tests__/`
  - **Frontend**: `packages/frontend/src/__tests__/`
- **File naming**: Match the file under test (e.g., `app.test.js` tests `app.js`, `TaskList.test.tsx` tests `TaskList.tsx`).

### Integration Tests
- **Framework**: Jest + Supertest.
- **Scope**: Test backend API endpoints end-to-end at the HTTP layer with real requests against the Express app. Use a real (or in-memory) data store rather than mocking the persistence layer.
- **Naming**: Files must use `*.test.js` or `*.test.ts`.
- **Location**: `packages/backend/__tests__/integration/`
- **File naming**: Name files intelligently based on what they test, e.g., `todos-api.test.js` for the TODO API endpoints, `health-api.test.js` for health-check endpoints.

### End-to-End (E2E) Tests
- **Framework**: **Playwright** (required — do not introduce Cypress, Selenium, or other E2E frameworks).
- **Scope**: Drive the real UI in a browser to validate complete user workflows against a running frontend + backend.
- **Naming**: Files must use `*.spec.js` or `*.spec.ts`.
- **Location**: `tests/e2e/`
- **File naming**: Name files after the user journey they cover, e.g., `todo-workflow.spec.js`, `task-editing.spec.js`.

## 2. Port Configuration

Always use environment variables with sensible defaults so CI/CD workflows can dynamically detect or override ports.

- **Backend**:
  ```js
  const PORT = process.env.PORT || 3030;
  ```
- **Frontend**: React's default development port is `3000`, and can be overridden via the `PORT` environment variable.
- Tests (integration and E2E) must read the same environment variables rather than hard-coding ports.

## 3. Playwright Rules

- **One browser only**: Configure Playwright to run against a single browser (Chromium). Do not enable cross-browser matrices.
- **Page Object Model (POM)**: All E2E tests must use the POM pattern. Page interactions (selectors, actions) live in page object classes under `tests/e2e/pages/`; spec files contain only test orchestration and assertions.
- **Test count**: Limit E2E suites to **5–8 critical user journeys**. Focus on happy paths and a few key edge cases — do not pursue exhaustive coverage at the E2E layer.
- **Selectors**: Prefer accessible selectors (`getByRole`, `getByLabel`, `getByText`) over CSS or XPath. Use `data-testid` only as a last resort.

## 4. Test Isolation and Reliability

- **Isolation**: Each test must set up its own data and must not depend on the order of execution or on data created by other tests.
- **Independence**: Tests must be runnable individually and in any order.
- **Setup and teardown**: Use `beforeEach`/`afterEach` (and `beforeAll`/`afterAll` where appropriate) to create and clean up state. Tests must pass reliably on repeated runs (no "first run only" passes).
- **Determinism**: Avoid time-, network-, or environment-dependent flakiness. Mock or freeze time where needed; control external services with fixtures or stubs.

## 5. Coverage Expectations

- All new features must ship with appropriate tests:
  - Pure logic and components → **unit tests**.
  - API endpoints → **integration tests**.
  - User-visible workflows → **E2E tests** (only if the workflow is critical and not already covered).
- Bug fixes must include a regression test that fails before the fix and passes after.
- Aim for meaningful coverage of behavior, not a coverage-percentage target.

## 6. Best Practices

- **One behavior per test**: Each test should assert a single behavior; use descriptive test names that read like specifications.
- **Arrange-Act-Assert**: Structure tests in three clear sections.
- **Avoid logic in tests**: No conditionals or loops that change what is being asserted.
- **Realistic data**: Use factory functions or builders to create domain objects; avoid sprawling shared fixtures.
- **Fast feedback**: Keep unit tests fast (< 100ms each typical). Push slower checks to integration/E2E layers.
- **Maintainability**: Refactor tests alongside production code. Treat test code with the same quality standards as application code.

## 7. Running Tests

From the repository root:

| Command                       | What it runs                              |
| ----------------------------- | ----------------------------------------- |
| `npm test`                    | Frontend + backend unit tests             |
| `npm run test:frontend`       | Frontend unit tests only                  |
| `npm run test:backend`        | Backend unit tests only                   |
| `npm run test:integration`    | Backend integration tests (Supertest)     |
| `npm run test:e2e`            | Playwright E2E tests                      |
| `npm run test:e2e:install`    | Install the Playwright Chromium browser   |
| `npm run test:all`            | Unit + integration + E2E tests            |
