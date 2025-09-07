# IMEI_Report

## 📦 Project Features

- Binary database support: PostgreSQL (Render) or better-sqlite3 (local)
- Automatically selects the database type based on the environment without changing the code

## ⚡️ Running Locally (SQLite)

1. Install the dependencies:
```bash
npm install
```

2. Add the better-sqlite3 library:
```bash
npm install better-sqlite3
```

3. Run the application:
```bash
npm run start
```

4. A local SQLite database named `local.db` will be automatically created if the `DATABASE_URL` variable does not exist.

---

## 🚀 Running on Render (PostgreSQL)

1. Create a PostgreSQL service on Render and obtain the connection link (DATABASE_URL).

2. Add the following environment variable to the service settings:
```
DATABASE_URL=postgresql://imei_report_db_user:LgWztZaOkxg5z9xI9g1p9dmItNlJh1EB@dpg-d2q81vt6ubrc73d2u7sg-a/imei_report_db
```

3. Execute the existing schema file named `schema.postgres.sql` in your PostgreSQL database (manually or via the control panel).

4. Run the application as usual (Render automatically detects the database).
