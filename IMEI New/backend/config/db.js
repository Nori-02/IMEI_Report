const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();

let db;

if (process.env.NODE_ENV === 'production') {
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  db = new sqlite3.Database('./dev.sqlite3');
}

module.exports = db;
