// ============================================================================
// Todo Model — Data access layer for the todos table
// ============================================================================
// Encapsulates all direct database queries. Controllers call these methods
// instead of writing raw SQL, keeping concerns cleanly separated.
// ============================================================================

const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const TodoModel = {
  // ── Retrieve all todos with optional filtering, searching, and sorting ────
  getAll({ priority, category, completed, search, sort = 'createdAt', order = 'desc' } = {}) {
    let query = 'SELECT * FROM todos WHERE 1=1';
    const params = [];

    // Filter by priority
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    // Filter by category
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    // Filter by completed status
    if (completed !== undefined && completed !== null && completed !== '') {
      query += ' AND completed = ?';
      params.push(Number(completed));
    }

    // Search in title and description
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    // Validate and apply sorting
    const allowedSortFields = ['createdAt', 'dueDate', 'priority', 'title'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';

    // Priority requires special ordering (urgent > high > medium > low)
    if (sortField === 'priority') {
      const priorityOrder = order.toUpperCase() === 'ASC'
        ? "CASE priority WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 WHEN 'urgent' THEN 4 END"
        : "CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END";
      query += ` ORDER BY ${priorityOrder}`;
    } else {
      const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortField} ${sortOrder}`;
    }

    return db.prepare(query).all(...params);
  },

  // ── Retrieve a single todo by its UUID ────────────────────────────────────
  getById(id) {
    return db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  },

  // ── Create a new todo ─────────────────────────────────────────────────────
  create({ title, description = null, priority = 'medium', category = 'general', dueDate = null }) {
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO todos (id, title, description, priority, category, dueDate, completed, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(id, title, description, priority, category, dueDate, now, now);

    return this.getById(id);
  },

  // ── Update an existing todo ───────────────────────────────────────────────
  update(id, { title, description, priority, category, dueDate, completed }) {
    const existing = this.getById(id);
    if (!existing) return null;

    const updatedAt = new Date().toISOString();

    // Merge provided fields with existing values (partial update support)
    const updatedTodo = {
      title: title !== undefined ? title : existing.title,
      description: description !== undefined ? description : existing.description,
      priority: priority !== undefined ? priority : existing.priority,
      category: category !== undefined ? category : existing.category,
      dueDate: dueDate !== undefined ? dueDate : existing.dueDate,
      completed: completed !== undefined ? Number(completed) : existing.completed,
    };

    db.prepare(`
      UPDATE todos
      SET title = ?, description = ?, priority = ?, category = ?, dueDate = ?, completed = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      updatedTodo.title,
      updatedTodo.description,
      updatedTodo.priority,
      updatedTodo.category,
      updatedTodo.dueDate,
      updatedTodo.completed,
      updatedAt,
      id
    );

    return this.getById(id);
  },

  // ── Toggle the completed status of a todo ─────────────────────────────────
  toggleComplete(id) {
    const existing = this.getById(id);
    if (!existing) return null;

    const updatedAt = new Date().toISOString();
    const newStatus = existing.completed ? 0 : 1;

    db.prepare('UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ?')
      .run(newStatus, updatedAt, id);

    return this.getById(id);
  },

  // ── Delete a todo by ID ───────────────────────────────────────────────────
  delete(id) {
    const existing = this.getById(id);
    if (!existing) return null;

    db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    return existing;
  },

  // ── Aggregate statistics across all todos ─────────────────────────────────
  getStats() {
    const total = db.prepare('SELECT COUNT(*) as count FROM todos').get().count;
    const completed = db.prepare('SELECT COUNT(*) as count FROM todos WHERE completed = 1').get().count;
    const pending = db.prepare('SELECT COUNT(*) as count FROM todos WHERE completed = 0').get().count;

    // Overdue = not completed AND dueDate is in the past
    const now = new Date().toISOString();
    const overdue = db.prepare(
      'SELECT COUNT(*) as count FROM todos WHERE completed = 0 AND dueDate IS NOT NULL AND dueDate < ?'
    ).get(now).count;

    // Counts grouped by priority
    const byPriorityRows = db.prepare(
      'SELECT priority, COUNT(*) as count FROM todos GROUP BY priority'
    ).all();
    const byPriority = {};
    for (const row of byPriorityRows) {
      byPriority[row.priority] = row.count;
    }

    // Counts grouped by category
    const byCategoryRows = db.prepare(
      'SELECT category, COUNT(*) as count FROM todos GROUP BY category'
    ).all();
    const byCategory = {};
    for (const row of byCategoryRows) {
      byCategory[row.category] = row.count;
    }

    return { total, completed, pending, overdue, byPriority, byCategory };
  },
};

module.exports = TodoModel;
