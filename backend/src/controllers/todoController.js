// ============================================================================
// Todo Controller — Request handlers for todo CRUD operations
// ============================================================================
// Each method handles a specific route action: validates input, delegates
// to the model, and returns a standardised JSON response.
// ============================================================================

const TodoModel = require('../models/todoModel');

const TodoController = {
  // ── GET /api/todos ────────────────────────────────────────────────────────
  // List all todos with optional query-param filtering & sorting
  getAllTodos(req, res, next) {
    try {
      const { priority, category, completed, search, sort, order } = req.query;
      const todos = TodoModel.getAll({ priority, category, completed, search, sort, order });

      res.status(200).json({
        success: true,
        count: todos.length,
        data: todos,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/todos/stats ──────────────────────────────────────────────────
  // Return aggregated statistics about all todos
  getStats(req, res, next) {
    try {
      const stats = TodoModel.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/todos/:id ────────────────────────────────────────────────────
  // Retrieve a single todo by UUID
  getTodoById(req, res, next) {
    try {
      const todo = TodoModel.getById(req.params.id);

      if (!todo) {
        return res.status(404).json({
          success: false,
          message: `Todo with id '${req.params.id}' not found`,
        });
      }

      res.status(200).json({
        success: true,
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── POST /api/todos ───────────────────────────────────────────────────────
  // Create a new todo (title is required)
  createTodo(req, res, next) {
    try {
      const { title, description, priority, category, dueDate, subtasks, tags } = req.body;

      // Validate required field
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Title is required and must be a non-empty string',
        });
      }

      // Validate priority if provided
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: `Priority must be one of: ${validPriorities.join(', ')}`,
        });
      }

      const todo = TodoModel.create({
        title: title.trim(),
        description: description ? description.trim() : null,
        priority,
        category: category ? category.trim() : 'general',
        dueDate: dueDate || null,
        subtasks: subtasks || [],
        tags: tags || [],
      });

      res.status(201).json({
        success: true,
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── PUT /api/todos/:id ────────────────────────────────────────────────────
  // Update an existing todo (partial updates supported)
  updateTodo(req, res, next) {
    try {
      const { title, description, priority, category, dueDate, completed, subtasks, tags } = req.body;

      // If title is being updated, ensure it's not empty
      if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Title must be a non-empty string',
        });
      }

      // Validate priority if provided
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: `Priority must be one of: ${validPriorities.join(', ')}`,
        });
      }

      const todo = TodoModel.update(req.params.id, {
        title: title ? title.trim() : undefined,
        description,
        priority,
        category,
        dueDate,
        completed,
        subtasks,
        tags,
      });

      if (!todo) {
        return res.status(404).json({
          success: false,
          message: `Todo with id '${req.params.id}' not found`,
        });
      }

      res.status(200).json({
        success: true,
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── PATCH /api/todos/:id/toggle ───────────────────────────────────────────
  // Toggle the completed status of a todo
  toggleTodo(req, res, next) {
    try {
      const todo = TodoModel.toggleComplete(req.params.id);

      if (!todo) {
        return res.status(404).json({
          success: false,
          message: `Todo with id '${req.params.id}' not found`,
        });
      }

      res.status(200).json({
        success: true,
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── DELETE /api/todos/:id ─────────────────────────────────────────────────
  // Remove a todo permanently
  deleteTodo(req, res, next) {
    try {
      const todo = TodoModel.delete(req.params.id);

      if (!todo) {
        return res.status(404).json({
          success: false,
          message: `Todo with id '${req.params.id}' not found`,
        });
      }

      res.status(200).json({
        success: true,
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = TodoController;
