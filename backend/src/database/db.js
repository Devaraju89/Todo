// ============================================================================
// Database Configuration — SQLite via better-sqlite3
// ============================================================================
// Initializes the SQLite database, creates the todos table if it doesn't
// exist, and seeds sample data on first run.
// ============================================================================

const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Resolve database file path (stored in project root)
const DB_PATH = path.resolve(__dirname, '../../todos.db');

// Initialize the database connection with WAL mode for better performance
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`📦 Database connected at: ${DB_PATH}`);

// ── Create the todos table if it doesn't exist ──────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    priority    TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
    category    TEXT DEFAULT 'general',
    dueDate     TEXT,
    completed   INTEGER DEFAULT 0,
    subtasks    TEXT DEFAULT '[]',
    tags        TEXT DEFAULT '[]',
    createdAt   TEXT NOT NULL,
    updatedAt   TEXT NOT NULL
  )
`);

// Support column migrations dynamically if db file already exists
try {
  db.exec("ALTER TABLE todos ADD COLUMN subtasks TEXT DEFAULT '[]'");
} catch (e) {
  // Ignore error if column already exists
}

try {
  db.exec("ALTER TABLE todos ADD COLUMN tags TEXT DEFAULT '[]'");
} catch (e) {
  // Ignore error if column already exists
}

console.log('✅ Todos table ready');

// Database connected and tables verified
module.exports = db;
