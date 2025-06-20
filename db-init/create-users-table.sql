CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

-- Add a default user: username: a, password: a (hashed)
INSERT INTO users (username, password_hash)
VALUES (
  'a',
  '$2a$12$JDfWu68SnAUkNRffwOZlN.0WyLqr0pzO9XRn/jmwAr7SQqND64r1K' -- bcrypt hash for 'a'
)
ON CONFLICT (username) DO NOTHING;