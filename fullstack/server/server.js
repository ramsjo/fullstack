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

async function ensureTodosTableExists() {
  try {
    const client = await pool.connect();

    // Check if 'todos' table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'todos'
      );
    `;

    const result = await client.query(checkTableQuery);

    const exists = result.rows[0].exists;

    if (exists) {
      console.log("✅ 'todos' table already exists.");
    } else {
      console.log("⚠️ 'todos' table not found. Creating...");

      const createTableQuery = `
        CREATE TABLE todos (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          completed BOOLEAN DEFAULT false
        );
      `;

      await client.query(createTableQuery);
      console.log("✅ 'todos' table created successfully.");
    }

    client.release();
  } catch (error) {
    console.error("❌ Error ensuring 'todos' table exists:", error);
  } finally {
    pool.end();
  }
}

ensureTodosTableExists();


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
