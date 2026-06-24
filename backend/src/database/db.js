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
    console.log('🌱 Seeding database with realistic software development todos...');

    const now = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const nextWeek = new Date(Date.now() + 604800000).toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();

    const sampleTodos = [
      {
        id: uuidv4(),
        title: 'Configure CI/CD deployment pipelines',
        description: 'Set up GitHub Actions to run frontend linting, run backend tests on SQLite, and build the production bundle.',
        priority: 'high',
        category: 'Work',
        dueDate: tomorrow,
        completed: 1,
        createdAt: now,
        updatedAt: now,
        subtasks: JSON.stringify([
          { id: 'sub-1', text: 'Write workflow YAML file', completed: true },
          { id: 'sub-2', text: 'Configure repo secrets', completed: true }
        ]),
        tags: JSON.stringify(['devops', 'ci-cd'])
      },
      {
        id: uuidv4(),
        title: 'Implement JWT Authentication & middleware',
        description: 'Create security controllers to issue tokens, handle cookie storage, and authorize private task endpoints.',
        priority: 'urgent',
        category: 'Work',
        dueDate: yesterday,
        completed: 1,
        createdAt: now,
        updatedAt: now,
        subtasks: JSON.stringify([
          { id: 'sub-3', text: 'Define user schema', completed: true },
          { id: 'sub-4', text: 'Setup token generation helper', completed: true }
        ]),
        tags: JSON.stringify(['backend', 'security'])
      },
      {
        id: uuidv4(),
        title: 'Optimize SQLite database query indexing',
        description: 'Profile slow queries and create custom indexes on todos(completed, priority) to accelerate dashboard rendering.',
        priority: 'high',
        category: 'Work',
        dueDate: nextWeek,
        completed: 1,
        createdAt: now,
        updatedAt: now,
        subtasks: JSON.stringify([]),
        tags: JSON.stringify(['database', 'performance'])
      },
      {
        id: uuidv4(),
        title: 'Write API endpoint integration tests',
        description: 'Connect Supertest to Express routes to verify CRUD operations, validate title requirements, and check invalid UUID formats.',
        priority: 'medium',
        category: 'Learning',
        dueDate: tomorrow,
        completed: 0,
        createdAt: now,
        updatedAt: now,
        subtasks: JSON.stringify([
          { id: 'sub-5', text: 'Setup test environment', completed: true },
          { id: 'sub-6', text: 'Write route test cases', completed: false }
        ]),
        tags: JSON.stringify(['testing', 'backend'])
      },
      {
        id: uuidv4(),
        title: 'Refactor CSS styling variable system',
        description: 'Abstract hardcoded color codes into theme utility tokens inside index.css for Amethyst and Sunset themes.',
        priority: 'medium',
        category: 'Work',
        dueDate: null,
        completed: 0,
        createdAt: now,
        updatedAt: now,
        subtasks: JSON.stringify([]),
        tags: JSON.stringify(['frontend', 'design'])
      },
      {
        id: uuidv4(),
        title: 'Audit NPM dependencies for security alerts',
        description: 'Run npm audit to identify vulnerability alerts and upgrade package-lock references.',
        priority: 'low',
        category: 'Learning',
        dueDate: tomorrow,
        completed: 0,
        createdAt: now,
        updatedAt: now,
        subtasks: JSON.stringify([]),
        tags: JSON.stringify(['security', 'package'])
      },
      {
        id: uuidv4(),
        title: 'Conduct UX design wireframe walkthrough',
        description: 'Present the Vision OS glassmorphism sidebar grid mocks to get alignment on layout ratios.',
        priority: 'low',
        category: 'Work',
        dueDate: nextWeek,
        completed: 0,
        createdAt: now,
        updatedAt: now,
        subtasks: JSON.stringify([]),
        tags: JSON.stringify(['design', 'ux'])
      },
      {
        id: uuidv4(),
        title: 'Daily cardio exercise session',
        description: 'Complete 30 minutes of high-intensity intervals.',
        priority: 'low',
        category: 'Health',
        dueDate: yesterday,
        completed: 1,
        createdAt: now,
        updatedAt: now,
        subtasks: JSON.stringify([]),
        tags: JSON.stringify(['fitness'])
      },
      {
        id: uuidv4(),
        title: 'Update monthly budgeting spreadsheet',
        description: 'Balance income statements, review server hosting expenditures, and calculate savings.',
        priority: 'medium',
        category: 'Finance',
        dueDate: yesterday,
        completed: 1,
        createdAt: now,
        updatedAt: now,
        subtasks: JSON.stringify([]),
        tags: JSON.stringify(['finance'])
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO todos (id, title, description, priority, category, dueDate, completed, subtasks, tags, createdAt, updatedAt)
      VALUES (@id, @title, @description, @priority, @category, @dueDate, @completed, @subtasks, @tags, @createdAt, @updatedAt)
    `);

    const insertMany = db.transaction((todos) => {
      for (const todo of todos) {
        insertStmt.run(todo);
      }
    });

    insertMany(sampleTodos);
    console.log(`✅ Seeded ${sampleTodos.length} realistic developer todos`);
  }
};

// Run seeder
seedDatabase();

// Database connected and tables verified
module.exports = db;
