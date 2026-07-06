<picture>
  <img src="./assets/logo.svg" alt="DevFlow Logo" width="120" align="left">
</picture>

<br><br><br>

# DevFlow AI — Testing Guide

A comprehensive guide to Jest-based unit testing for backend utilities, complete with Node.js environment configuration and coverage reporting.

## Table of Contents

- [Overview](#overview)
- [Test Stack](#test-stack)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Writing Tests](#writing-tests)
- [Future Improvements](#future-improvements)
- [Best Practices](#best-practices)
- [Related Documents](#related-documents)
- [Next Reading](#next-reading)

---

## Overview

The project currently has unit tests for the backend utility modules (`AppError` and `asyncHandler`). Tests use **Jest** and run in a Node.js environment. The test suite validates the custom error class and async route wrapper that form the critical foundation of the server's error handling.

> [!NOTE]
> Testing is currently focused on backend utilities. Frontend and integration testing layers are part of the future testing roadmap.

---

## Test Stack

| Tool | Version | Purpose |
|---|---|---|
| **Jest** | 29.7 | Test runner and assertions |
| **Node.js** | 18+ | Test execution environment |

---

## Configuration

The testing configuration is located at `server/jest.config.js`:

```javascript
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/server.js"],
};
```

> [!TIP]
> **Key Settings Explained:**
> - `testEnvironment: "node"`: Ensures server-side tests run without DOM dependencies.
> - `roots: ["<rootDir>/src"]`: Keeps tests living alongside the source code.
> - `testMatch`: A glob pattern specifically identifying test files.
> - `collectCoverageFrom`: Excludes the `server.js` entry point from coverage calculations to prevent skewed metrics.

---

## Running Tests

To run the test suite, navigate to the `server` directory and use the NPM test script:

```bash
cd server
npm.cmd test
```

Under the hood, the test script runs the following command:

```bash
node --experimental-vm-modules node_modules/.bin/jest --forceExit --detectOpenHandles
```

> [!IMPORTANT]
> **Flags Explained:**
> - `--experimental-vm-modules`: Enables ES module support within Jest's VM.
> - `--forceExit`: Forces Jest to exit after tests complete, ensuring processes don't hang due to open handles.
> - `--detectOpenHandles`: Prints warnings for open handles, aiding in debugging memory leaks or lingering connections.

---

## Test Coverage

### Current Tests (`server/src/__tests__/utils.test.js`)

**AppError**
- Creates an error with a given message and status code.
- Defaults to status 500 when not specified.
- Returns the correct `name` property (`"AppError"`).

**asyncHandler**
- Wraps async functions and successfully catches thrown errors.
- Passes errors to the Express `next()` function.
- Passes through successful execution without calling `next()`.

### Coverage Commands

Generate coverage reports to identify untested code paths:

```bash
# Run with coverage flag
npx jest --coverage
```

> [!NOTE]
> Coverage thresholds are configured in `jest.config.js` via the `collectCoverageFrom` property.

---

## Writing Tests

Tests follow the `__tests__` convention, keeping them alongside their corresponding source code files.

```text
server/src/
├── utils/
│   ├── AppError.js
│   └── asyncHandler.js
└── __tests__/
    └── utils.test.js
```

### Test Pattern Example

Here is an example demonstrating the testing pattern used for backend utilities:

```javascript
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

describe("AppError", () => {
  it("creates an error with the given message and status code", () => {
    const error = new AppError("Test error", 400);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("AppError");
  });
});

describe("asyncHandler", () => {
  it("wraps a function and catches errors", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();
    const fn = async () => { throw new Error("async error"); };
    
    const wrapped = asyncHandler(fn);
    await wrapped(mockReq, mockRes, mockNext);
    
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});
```

---

## Future Improvements

As the platform scales, the testing strategy will evolve to include:

- **Controller tests:** Mock Mongoose models and test individual controllers in isolation.
- **Integration tests:** Test full request/response cycles using `supertest`.
- **Frontend tests:** Implement Jest + React Testing Library for comprehensive component testing.
- **E2E tests:** Integrate Playwright or Cypress to validate complete user flows.
- **API contract tests:** Validate request and response schemas to prevent breaking changes.
- **Rate limiter tests:** Verify API rate limits are enforced correctly under load.

---

## Best Practices

> [!TIP]
> Follow these guidelines to maintain a robust and readable test suite:
> - **Keep tests isolated:** Ensure tests do not rely on the state of other tests.
> - **Mock external services:** Avoid calling real databases or external APIs during unit testing. Use Jest mocks instead.
> - **Test behaviors, not implementation:** Focus on the expected inputs and outputs rather than internal logic.
> - **Maintain folder structure:** Always place test files in a `__tests__` directory alongside the file being tested to maintain discoverability.

---

## Related Documents

- [Backend Architecture](./backend.md)
- [Architecture Overview](./architecture.md)
- [Deployment Guide](./deployment.md)

## Next Reading

> **Next:** [Troubleshooting Guide](./troubleshooting.md) — Common issues and solutions for development and production environments.

---

<p align="center">
  <sub>Built with Next.js, Express, MongoDB, and Groq AI</sub>
  <br>
  <sub>&copy; DevFlow AI — Documentation</sub>
</p>
