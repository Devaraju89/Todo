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

// ── Seed sample data if table is empty ──────────────────────────────────────
const seedDatabase = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM todos').get();

  if (count.count === 0) {
    console.log('🌱 Seeding database with sample todos...');

    const now = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const nextWeek = new Date(Date.now() + 604800000).toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();

    const sampleTodos = [
      {
        id: uuidv4(),
        title: 'Set up project architecture',
        description: 'Initialize the monorepo structure with frontend and backend directories, configure build tools, and set up linting.',
        priority: 'high',
        category: 'development',
        dueDate: tomorrow,
        completed: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        title: 'Design the database schema',
        description: 'Create the SQLite schema for todos with proper indexes and constraints. Include fields for priority, category, and due dates.',
        priority: 'urgent',
        category: 'development',
        dueDate: yesterday,
        completed: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        title: 'Write API documentation',
        description: 'Document all REST endpoints, request/response formats, and error codes using Markdown.',
        priority: 'medium',
        category: 'documentation',
        dueDate: nextWeek,
        completed: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        title: 'Buy groceries',
        description: 'Pick up vegetables, fruits, milk, and bread from the local store.',
        priority: 'low',
        category: 'personal',
        dueDate: tomorrow,
        completed: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        title: 'Review pull requests',
        description: 'Go through open PRs on GitHub, leave constructive feedback, and approve or request changes.',
        priority: 'high',
        category: 'work',
        dueDate: null,
        completed: 0,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const insertStmt = db.prepare(`
      INSERT INTO todos (id, title, description, priority, category, dueDate, completed, createdAt, updatedAt)
      VALUES (@id, @title, @description, @priority, @category, @dueDate, @completed, @createdAt, @updatedAt)
    `);

    const insertMany = db.transaction((todos) => {
      for (const todo of todos) {
        insertStmt.run(todo);
      }
    });

    insertMany(sampleTodos);
    console.log(`✅ Seeded ${sampleTodos.length} sample todos`);
  }
};

// Run the seeder
seedDatabase();

module.exports = db;
