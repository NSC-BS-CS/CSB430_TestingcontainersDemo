// userRepository.js
// Represents the DatabaseLayer in the Online Bookstore system.
// Responsible for saving and retrieving users from PostgreSQL.

async function createUserTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )
  `);
}

async function insertUser(client, name, email) {
  const result = await client.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
    [name, email]
  );
  return result.rows[0];
}

async function getUserByEmail(client, email) {
  const result = await client.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

module.exports = { createUserTable, insertUser, getUserByEmail };
