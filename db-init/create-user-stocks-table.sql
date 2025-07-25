CREATE TABLE IF NOT EXISTS user_stocks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(16) NOT NULL,
  UNIQUE(user_id, symbol)
);