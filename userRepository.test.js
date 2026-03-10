// userRepository.test.js
// Integration test using Testcontainers.
//
// Instead of mocking the database, Testcontainers spins up a REAL
// PostgreSQL instance in Docker, runs our tests against it, then
// tears it down automatically when done.
//
// Requirements:
//   npm install testcontainers pg
//   Docker must be running

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { PostgreSqlContainer } = require("@testcontainers/postgresql");
const { Client } = require("pg");
const { createUserTable, insertUser, getUserByEmail } = require("./userRepository");

// -------------------------------------------------------------------
// Setup: start a real PostgreSQL container before any tests run
// -------------------------------------------------------------------

let container;  // The Docker container
let client;     // Our database connection

before(async () => {
  console.log("Starting PostgreSQL container...");

  // Testcontainers pulls and starts a real postgres:14 Docker image.
  // No need to install or configure Postgres on your machine.
  container = await new PostgreSqlContainer("postgres:14").start();

  // Connect to the database running inside the container
  client = new Client({
    host: container.getHost(),
    port: container.getMappedPort(5432),
    database: container.getDatabase(),
    user: container.getUsername(),
    password: container.getPassword(),
  });

  await client.connect();

  // Create the users table so our tests have something to work with
  await createUserTable(client);

  console.log("PostgreSQL container ready.");
});

// -------------------------------------------------------------------
// Teardown: stop the container after all tests finish
// -------------------------------------------------------------------

after(async () => {
  await client.end();
  await container.stop();
  console.log("PostgreSQL container stopped.");
});

// -------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------

test("should insert a user and retrieve them by email", async () => {
  // Arrange
  const name = "Alice";
  const email = "alice@example.com";

  // Act
  const inserted = await insertUser(client, name, email);
  const found = await getUserByEmail(client, email);

  // Assert
  assert.equal(inserted.name, name);
  assert.equal(inserted.email, email);
  assert.equal(found.email, email);
});

test("should return null when user does not exist", async () => {
  // Act
  const result = await getUserByEmail(client, "nobody@example.com");

  // Assert
  assert.equal(result, null);
});

test("should not allow duplicate emails", async () => {
  // Arrange
  await insertUser(client, "Bob", "bob@example.com");

  // Act & Assert
  // Inserting the same email a second time should throw a DB error
  await assert.rejects(
    () => insertUser(client, "Bob Again", "bob@example.com"),
    { message: /duplicate key value/ }
  );
});
