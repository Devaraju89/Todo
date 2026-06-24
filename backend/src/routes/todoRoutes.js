// ============================================================================
// Todo Routes — Maps HTTP verbs + paths to controller methods
// ============================================================================
// IMPORTANT: The /stats route MUST be defined BEFORE /:id to prevent Express
// from interpreting "stats" as a UUID parameter.
// ============================================================================

const express = require('express');
const router = express.Router();
const TodoController = require('../controllers/todoController');

// ── Statistics (must come before /:id) ──────────────────────────────────────
router.get('/stats', TodoController.getStats);

// ── CRUD routes ─────────────────────────────────────────────────────────────
router.get('/',          TodoController.getAllTodos);
router.get('/:id',       TodoController.getTodoById);
router.post('/',         TodoController.createTodo);
router.put('/:id',       TodoController.updateTodo);
router.patch('/:id/toggle', TodoController.toggleTodo);
router.delete('/:id',    TodoController.deleteTodo);

module.exports = router;
