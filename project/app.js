// COMP3028 Lecture 08 companion example.
// Copy .env.example to .env and provide your own local database details.
require('dotenv').config();
const express = require('express');
const postgres = require('postgres');
const fileUpload = require('express-fileupload');
const path = require('node:path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ limits: { fileSize: 2 * 1024 * 1024 }, abortOnLimit: true }));

const sql = postgres(process.env.DATABASE_URL);

app.get('/', (req, res) => {
  res.send('Hello from Node.js!');
});

app.get('/hello', (req, res) => {
  const name = req.query.name || 'student';
  res.json({ message: `Hello, ${name}!` });
});

app.get('/product/:id', (req, res) => {
  res.json({ productId: req.params.id });
});

app.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

app.post('/feedback', (req, res) => {
  const { name, message } = req.body || {};
  res.json({ receivedFrom: name, feedback: message });
});

app.post('/api/echo', (req, res) => {
  const name = req.body?.name;
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name required' });
  }
  res.json({ received: name });
});

app.get('/upload-form', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.post('/upload', (req, res) => {
  const file = req.files?.file;
  if (!file) {
    return res.status(400).json({ error: 'No file sent' });
  }
  res.json({ filename: file.name, bytes: file.size });
});

app.get('/db-check', async (req, res) => {
  try {
    const rows = await sql`SELECT NOW() AS server_time`;
    res.json({ databaseTime: rows[0].server_time });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database unavailable' });
  }
});

app.get('/api/books', async (req, res) => {
  try {
    const rows = await sql`
      SELECT id, title, author FROM books ORDER BY id
    `;
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/books', async (req, res) => {
  const { title, author } = req.body || {};
  if (typeof title !== 'string' || !title.trim() ||
      typeof author !== 'string' || !author.trim()) {
    return res.status(400).json({ error: 'Title and author required' });
  }
  try {
    const rows = await sql`
      INSERT INTO books (title, author)
      VALUES (${title.trim()}, ${author.trim()})
      RETURNING id, title, author
    `;
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/books/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  try {
    const rows = await sql`
      SELECT id, title, author FROM books WHERE id = ${id}
    `;
    if (!rows.length) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server: http://localhost:${port}`);
});
