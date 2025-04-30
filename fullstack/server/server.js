require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/api/db-check', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ connected: true, time: result.rows[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ connected: false, error: err.message });
  }
});

app.get('/api/todos', async (req, res) => {
  const result = await db.query('SELECT * FROM todos');
  res.json(result.rows);
});

app.post('/api/todos', async (req, res) => {
  const { text } = req.body;
  await db.query('INSERT INTO todos (text) VALUES ($1)', [text]);
  res.sendStatus(201);
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port 5000')
});
