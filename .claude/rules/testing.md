---
globs: src/**/*.test.*
---

File naming:
- Unit tests: `ComponentName.test.tsx` or `module-name.test.ts`
- Integration tests: `module-name.integration.test.ts`
- Colocate test files next to source files

Organization:
- Organize test files by feature
- Group related tests using `describe`

Core Principles:
- Write tests in English
- Follow Arrange-Act-Assert (AAA) pattern
- Prefer action-based user interaction tests
- Use descriptive test names
- Use existing types for tests

Test Data:
- Inline test data per test — no shared variables across tests
- DRY for test infra (render wrapper, server setup)
- WET for test data (duplicate setup is fine)

Unit Tests:
- Test one functional unit only
- Mock all external dependencies
- Keep tests fast and independent
- Test input/output contract only — never spy on internal functions
- Reserve unit tests for pure logic (utils, calculations, transforms)

Flaky Tests:
- Fix immediately or delete — never skip and move on
- A flaky test destroys CI trust faster than no test

Mocking:
- Mock only external dependencies (API, browser)
- Do not test presentational components (dumb in smart/dumb pattern)
- Test smart components: user interactions, conditional rendering
