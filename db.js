import dotenv from 'dotenv';
dotenv.config();

let db = null;
let isPostgres = false;

// تهيئة الاتصال حسب البيئة
export async function initDB() {
  if (process.env.DATABASE_URL) {
    // PostgreSQL على Render
    const { Client } = await import('pg');
    db = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    await db.connect();
    isPostgres = true;
    console.log('✅ Connected to PostgreSQL!');
  } else {
    // SQLite محليًا عبر better-sqlite3
    const Database = (await import('better-sqlite3')).default;
    db = new Database('./local.db');
    isPostgres = false;
    console.log('✅ Connected to better-sqlite3 (SQLite)!');
  }
}

// استعلام موحد (SELECT/INSERT/UPDATE/DELETE)
export async function query(sql, params = []) {
  if (!db) throw new Error('Database not initialized!');
  if (isPostgres) {
    const res = await db.query(sql, params);
    return res.rows;
  } else {
    // better-sqlite3: الاستعلامات
    if (/^\s*select/i.test(sql)) {
      const stmt = db.prepare(sql);
      return stmt.all(params);
    } else {
      const stmt = db.prepare(sql);
      return stmt.run(params);
    }
  }
}

// إغلاق الاتصال (اختياري)
export async function closeDB() {
  if (!db) return;
  if (isPostgres) {
    await db.end();
  } else {
    db.close();
  }
}
