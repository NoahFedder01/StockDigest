CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

-- Add a default user: username: testuser, password: testpass (hashed)
INSERT INTO users (username, password_hash)
VALUES (
  'testuser',
  '$2a$10$wH6QwQFQ9n8QwQwQwQwQwOeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw' -- bcrypt hash for 'testpass'
)
ON CONFLICT (username) DO NOTHING;