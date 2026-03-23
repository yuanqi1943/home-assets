import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname, '../data/assets.db')) as Database.Database;

// 初始化表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL,
    category TEXT,
    purchase_date TEXT,
    warranty_period INTEGER,
    description TEXT,
    image_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;