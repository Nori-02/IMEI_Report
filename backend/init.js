const db = require('./config/db');
const bcrypt = require('bcrypt');

const initSQLite = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imei TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    const password = 'admin123';
    const hash = bcrypt.hashSync(password, 10);

    db.run(`INSERT OR IGNORE INTO admins (username, password_hash) VALUES (?, ?)`, ['admin', hash]);
    console.log('✅ SQLite initialized');
  });
};

const initPostgres = async () => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      imei VARCHAR(20) NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    const password = 'admin123';
    const hash = bcrypt.hashSync(password, 10);

    await db.query(`INSERT INTO admins (username, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING`, ['admin', hash]);

    console.log('✅ PostgreSQL initialized');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
};

if (process.env.NODE_ENV === 'production') {
  initPostgres();
} else {
  initSQLite();
}
