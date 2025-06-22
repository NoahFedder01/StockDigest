require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Debug: Log when server starts and environment variables
console.log('Starting backend...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***set***' : '***NOT SET***');

// Debug: Test endpoint
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Sign up endpoint
app.post('/signup', async (req, res) => {
  console.log('Signup attempt:', req.body);
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
      [username, hash]
    );
    const userId = result.rows[0].id;
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User created', token });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(400).json({ error: 'Username already exists' });
  }
});

// Log in endpoint
app.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body);
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) {
      console.log('Login failed: user not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.log('Login failed: invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful for user:', username);
    res.json({ token });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware to authenticate and get userId from JWT
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get all stocks for the logged-in user
app.get('/mystocks', authenticate, async (req, res) => {
  const result = await pool.query(
    'SELECT symbol FROM user_stocks WHERE user_id = $1',
    [req.userId]
  );
  res.json({ stocks: result.rows.map(r => r.symbol) });
});

// Add a stock for the logged-in user
app.post('/mystocks', authenticate, async (req, res) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: 'No symbol' });
  try {
    await pool.query(
      'INSERT INTO user_stocks (user_id, symbol) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.userId, symbol]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Could not add stock' });
  }
});

// Delete a stock for the logged-in user
app.delete('/mystocks', authenticate, async (req, res) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: 'No symbol' });
  await pool.query(
    'DELETE FROM user_stocks WHERE user_id = $1 AND symbol = $2',
    [req.userId, symbol]
  );
  res.json({ success: true });
});

app.listen(3001, () => console.log('API running on port 3001'));