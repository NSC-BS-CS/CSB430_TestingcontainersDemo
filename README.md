# Testcontainers Demo — Node.js + PostgreSQL

This example shows how to use Testcontainers to run integration tests
against a real PostgreSQL database without any manual setup.

## Prerequisites

- Node.js 18+
- Docker (must be running — no manual container setup needed)

## Setup

Install dependencies:

```bash
npm install
npm install @testcontainers/postgresql
```

## Run the tests

```bash
npm test
```

Docker does not need to be touched manually. Testcontainers automatically
pulls, starts, and stops the PostgreSQL container when you run `npm test`.

## What happens when you run the tests?

1. Testcontainers pulls a `postgres:14` Docker image (first run only)
2. A real PostgreSQL container starts automatically
3. The tests run against the real database
4. The container is stopped and removed when tests finish

## Important: package versions

`PostgreSqlContainer` is not bundled with the core `testcontainers` package
in version 10+. It must be installed as a separate scoped package:

```bash
npm install @testcontainers/postgresql
```

And imported in your test file as:

```javascript
const { PostgreSqlContainer } = require("@testcontainers/postgresql");
```

Using `require("testcontainers")` alone will result in a
`PostgreSqlContainer is not a constructor` error.

## Files

- `userRepository.js` — the module being tested (DatabaseLayer)
- `userRepository.test.js` — integration tests using Testcontainers

## Key concept

Without Testcontainers you would need to either:

- Mock the database (not a true integration test), or
- Maintain a shared dev database (flaky, slow, hard to reset)

Testcontainers gives you a real database that is:

- Isolated per test run
- Automatically cleaned up
- Identical across all developer machines and CI/CD
