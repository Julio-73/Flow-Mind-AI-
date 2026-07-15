# FlowMind AI — Testing Guide

---

## Test Strategy (Pyramid)

```
        ╱╲
       ╱ E2E ╲           Playwright — critical user journeys
      ╱────────╲
     ╱Integration╲        API + Database — flow execution, engine
    ╱──────────────╲
   ╱   Unit Tests    ╲    Vitest — value objects, domain logic, utils
  ╱────────────────────╲
 ╱   Static Analysis    ╲  TypeScript strict, ESLint, Zod validation
╱──────────────────────────╲
```

| Layer | Tool | Count | Target |
|---|---|---|---|
| Static | TypeScript strict + ESLint | — | Type errors, code quality |
| Unit | Vitest | 15+ | Value objects, domain logic, utils |
| Component | Vitest + Testing Library | 5+ | UI components |
| Integration | Vitest | 8+ | Engine execution, resolvers |
| E2E | Playwright | 5+ | Critical user flows |

---

## Unit Tests (Vitest)

### Configuration

Each package has its own `vitest.config.ts`. Root config would be in `vitest.workspace.ts` (add if needed).

```typescript
// apps/web/vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["components/**/*.tsx", "hooks/**/*.ts", "lib/**/*.ts"],
      exclude: ["**/index.ts", "**/*.d.ts"],
    },
  },
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @flowmind/core test
pnpm --filter @flowmind/engine test
pnpm --filter @flowmind/ai test
pnpm --filter @flowmind/database test
pnpm --filter @flowmind/web test

# Watch mode
pnpm --filter @flowmind/web test:watch

# Coverage
pnpm --filter @flowmind/web test:coverage
```

### What We Unit Test

| Package | File | What It Tests |
|---|---|---|
| `@flowmind/core` | `tests/value-objects/slug.test.ts` | Slug creation, normalization, validation |
| `@flowmind/core` | `tests/value-objects/role.test.ts` | Role hierarchy, permission checks |
| `@flowmind/engine` | `tests/executor.test.ts` | Flow execution, node ordering, error handling |
| `@flowmind/engine` | `tests/variable-resolver.test.ts` | Template interpolation, nested paths |
| `@flowmind/engine` | `tests/retry-manager.test.ts` | Retry logic, backoff calculation |
| `@flowmind/ai` | `tests/models.test.ts` | Model config, environment parsing |
| `@flowmind/database` | `tests/connection.test.ts` | Connection pool, health check |

### Writing Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { Slug } from "../src/value-objects/slug";

describe("Slug", () => {
  it("creates a valid slug from a string", () => {
    const slug = Slug.create("Hello World");
    expect(slug.toString()).toBe("hello-world");
  });

  it("throws on invalid characters", () => {
    expect(() => Slug.create("Hello World!")).toThrow();
  });

  it("compares slugs correctly", () => {
    const a = Slug.create("hello-world");
    const b = Slug.create("hello-world");
    const c = Slug.create("other-slug");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
```

---

## Integration Tests

Integration tests verify that multiple units work together correctly, including database access and engine execution.

### Engine Integration

```typescript
// packages/engine/tests/executor.test.ts
describe("Executor", () => {
  it("executes a linear flow from trigger to action", async () => { ... });
  it("handles condition nodes with true/false branches", async () => { ... });
  it("detects cycles and fails execution", async () => { ... });
  it("retries failed nodes up to maxRetries", async () => { ... });
  it("resolves variables with context interpolation", async () => { ... });
});
```

### Database Integration

```typescript
// packages/database/tests/connection.test.ts
describe("Database Connection", () => {
  it("connects to PostgreSQL", async () => { ... });
  it("runs health check query", async () => { ... });
  it("handles connection pool exhaustion gracefully", async () => { ... });
});
```

---

## Component Tests (Testing Library)

Components are tested with Vitest + `@testing-library/react`.

### Components with Tests

| Component | File | What It Tests |
|---|---|---|
| `Button` | `tests/components/button.test.tsx` | Variants, disabled state, click handler |
| `Card` | `tests/components/card.test.tsx` | Variants, states (default, hover, active) |
| `StatsCard` | `tests/components/stats-card.test.tsx` | Loading, error, empty, data states |
| `FlowCard` | `tests/components/flow-card.test.tsx` | Flow status badges, actions |
| `DataTable` | `tests/components/data-table.test.tsx` | Sorting, pagination, empty state |

### Writing Component Tests

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText("Disabled")).toBeDisabled();
  });
});
```

---

## E2E Tests (Playwright)

Playwright tests cover complete user flows against a running instance.

### Configuration

```typescript
// apps/web/playwright.config.ts
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm exec playwright test tests/e2e/login.spec.ts

# Run with UI mode
pnpm exec playwright test --ui

# View HTML report
pnpm exec playwright show-report
```

### E2E Test Suites

| File | Tests |
|---|---|
| `login.spec.ts` | Login page elements, successful login, invalid credentials, form validation, Google OAuth button |
| `dashboard.spec.ts` | Dashboard stats, navigation, recent flows, activity feed |
| `flows.spec.ts` | Create flow, edit canvas, add nodes, save draft, publish, delete |
| `navigation.spec.ts` | Sidebar navigation, workspace switching, keyboard shortcuts |
| `settings.spec.ts` | Profile update, organization settings, API key management |

### Sample E2E Test

```typescript
import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("navigates to dashboard on successful login", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@flowmind.ai");
    await page.fill('input[type="password"]', "correctpassword");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "invalid@test.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Login failed")).toBeVisible({ timeout: 10000 });
  });
});
```

---

## Code Coverage

### Current Targets

| Area | Current | Target |
|---|---|---|
| Core (value objects) | 95%+ | 95% |
| Engine (executor) | 85% | 90% |
| AI (copilot, parser) | 70% | 85% |
| Shared (utils, errors) | 80% | 90% |
| Components (UI) | 75% | 85% |
| Database (repositories) | 60% | 80% |
| **Overall** | **78%** | **85%** |

### Coverage Reports

```bash
# Generate coverage for all packages
pnpm --filter @flowmind/core test:coverage
pnpm --filter @flowmind/engine test:coverage
pnpm --filter @flowmind/web test:coverage
```

Coverage reports are generated in each package's `coverage/` directory as HTML.

---

## CI Pipeline

Tests run automatically in CI via GitHub Actions (see `.github/workflows/ci.yml`):

```
Pull Request
    ↓
  Lint ──→ Typecheck ──→ Unit/Integration Tests ──→ E2E Tests
                                   ↓
                              Coverage Report
                                   ↓
                              Security Check
                                   ↓
                              ✅ Ready to merge
```
