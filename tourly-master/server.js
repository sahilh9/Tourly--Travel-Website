const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// SQLite setup
const db = new sqlite3.Database(path.join(__dirname, 'tourly.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    passwordHash TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )`);
});

// Helpers
function sendError(res, status, msg) { return res.status(status).json({ error: msg }); }

// Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body || {};
    if (!firstName || !lastName || !email || !password) return sendError(res, 400, 'Missing required fields');
    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    const stmt = db.prepare('INSERT INTO users (firstName,lastName,email,phone,passwordHash,createdAt) VALUES (?,?,?,?,?,?)');
    stmt.run(firstName, lastName, email.toLowerCase(), phone || '', passwordHash, createdAt, function (err) {
      if (err) {
        if (String(err.message).includes('UNIQUE')) return sendError(res, 409, 'Email already registered');
        return sendError(res, 500, 'Failed to create user');
      }
      res.json({ id: this.lastID, firstName, lastName, email, phone, createdAt });
    });
  } catch (e) { return sendError(res, 500, 'Server error'); }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return sendError(res, 400, 'Missing email or password');
  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], async (err, row) => {
    if (err) return sendError(res, 500, 'Server error');
    if (!row) return sendError(res, 401, 'Invalid credentials');
    const ok = await bcrypt.compare(password, row.passwordHash);
    if (!ok) return sendError(res, 401, 'Invalid credentials');
    res.json({ id: row.id, firstName: row.firstName, lastName: row.lastName, email: row.email });
  });
});

app.listen(PORT, () => console.log(`Tourly server running on http://localhost:${PORT}`));


