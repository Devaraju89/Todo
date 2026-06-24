import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiInbox, FiGrid, FiList, FiDownload, FiUpload, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';
import FilterBar from '../components/FilterBar';
import StatsPanel from '../components/StatsPanel';
import ConfirmModal from '../components/ConfirmModal';
import PomodoroTimer from '../components/PomodoroTimer';
import CalendarView from '../components/CalendarView';
import KanbanBoard from '../components/KanbanBoard';
import {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  getStats,
} from '../services/api';

/**
 * TodoListPage — Main task list page with full CRUD functionality
 * Features: Stats panel, filter bar, animated todo grid,
 * inline editing, confirm modals, empty/loading states,
 * and Eisenhower Matrix Quadrants View
 */
const TodoListPage = () => {
  // ---- State Management ----
  const [todos, setTodos] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'matrix'
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    category: '',
    status: '',
    sort: 'createdAt',
  });

  // ---- Data Fetching ----

  /** Fetch todos with current filter parameters */
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.sort) params.sort = filters.sort;

      const data = await getAllTodos(params);
      setTodos(Array.isArray(data) ? data : data.todos || []);
    } catch (error) {
      toast.error('Failed to load tasks');
      console.error('Fetch todos error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /** Fetch aggregate statistics */
  const fetchStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  }, []);

  // Initial data fetch and re-fetch on filter changes
  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, [fetchTodos, fetchStats]);

  // ---- CRUD Operations ----

  /** Create a new todo */
  const handleCreate = async (formData) => {
    try {
      await createTodo(formData);
      toast.success('Task created successfully! 🎉');
      setShowForm(false);
      fetchTodos();
      fetchStats();
    } catch (error) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  /** Update an existing todo */
  /** Update an existing todo */
  const handleUpdate = async (formData) => {
    try {
      await updateTodo(editingTodo.id, formData);
      toast.success('Task updated successfully! ✨');
      setEditingTodo(null);
      fetchTodos();
      fetchStats();
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  /** Update a card property directly (like checklist toggle or priority shift) */
  const handleUpdateCard = async (id, updatedFields) => {
    try {
      await updateTodo(id, updatedFields);
      fetchTodos();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update task checklist');
      console.error(error);
    }
  };

  /** Export all tasks to JSON file */
  const handleExport = () => {
    try {
      if (todos.length === 0) {
        toast.error('No tasks to export!');
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todos, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `taskflow_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Tasks exported successfully! 📥');
    } catch (e) {
      toast.error('Export failed');
    }
  };

  /** Import tasks from JSON file */
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedTodos = JSON.parse(event.target.result);
        if (!Array.isArray(importedTodos)) {
          toast.error('Invalid file format. Must be a JSON array of tasks.');
          return;
        }

        let successCount = 0;
        setLoading(true);

        for (const t of importedTodos) {
          if (t.title) {
            // Re-create each todo on the server
            await createTodo({
              title: t.title,
              description: t.description || '',
              priority: t.priority || 'low',
              category: t.category || 'General',
              dueDate: t.dueDate || null,
              subtasks: t.subtasks || [],
              tags: t.tags || [],
            });
            successCount++;
          }
        }

        toast.success(`Successfully imported ${successCount} tasks! 📤`);
        fetchTodos();
        fetchStats();
      } catch (err) {
        toast.error('Import failed. Invalid JSON structure.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  /** Toggle todo completion status */
  const handleToggle = async (id) => {
    try {
      await toggleTodo(id);
      fetchTodos();
      fetchStats();
    } catch (error) {
      toast.error('Failed to toggle task');
    }
  };

  /** Handles completing a task when its Pomodoro timer expires */
  const handleCompleteFocus = async (todoId) => {
    try {
      await toggleTodo(todoId);
      fetchTodos();
      fetchStats();
      toast.success('Awesome! Focus task completed! 🏆');
    } catch (e) {
      toast.error('Failed to complete focus task');
    }
  };

  /** Confirm and execute deletion */
  const handleDeleteConfirm = async () => {
    try {
      await deleteTodo(deleteTarget);
      toast.success('Task deleted');
      setDeleteTarget(null);
      fetchTodos();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  /** Open edit mode for a specific todo */
  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setShowForm(false); // Close create form if open
  };

  // ---- Computed Values ----

  /** Format today's date for the page subtitle */
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="page-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ---- Page Header ---- */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{today}</p>
        </div>

        {/* Add Task Button */}
        <motion.button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingTodo(null);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus size={20} />
          {showForm ? 'Close' : 'Add Task'}
        </motion.button>
      </motion.div>

      {/* ---- Stats Panel ---- */}
      <StatsPanel stats={stats} />

      {/* ---- Pomodoro Focus Space ---- */}
      <PomodoroTimer todos={todos} onCompleteFocus={handleCompleteFocus} />

      {/* ---- Create Form (animated expand/collapse) ---- */}
      <AnimatePresence>
        {showForm && (
          <TodoForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* ---- Edit Form (inline, replaces create form) ---- */}
      <AnimatePresence>
        {editingTodo && (
          <TodoForm
            initialData={editingTodo}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTodo(null)}
          />
        )}
      </AnimatePresence>

      {/* ---- View Switcher & Backup Actions ---- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div className="view-tabs" style={{ margin: 0 }}>
          <button 
            className={`view-tab-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FiList size={16} /> List Board
          </button>
          <button 
            className={`view-tab-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            <FiGrid size={16} /> Kanban Board
          </button>
          <button 
            className={`view-tab-btn ${viewMode === 'matrix' ? 'active' : ''}`}
            onClick={() => setViewMode('matrix')}
          >
            <FiGrid size={16} /> Eisenhower Matrix
          </button>
          <button 
            className={`view-tab-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <FiCalendar size={16} /> Deadlines Calendar
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleExport} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <FiDownload size={14} style={{ marginRight: '6px' }} /> Export Backup
          </button>
          <label className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem', cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center' }}>
            <FiUpload size={14} style={{ marginRight: '6px' }} /> Import Backup
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* ---- Filter Bar ---- */}
      <FilterBar filters={filters} onFilterChange={setFilters} />

      {/* ---- Todo Grid / Loading / Empty States ---- */}
      {loading ? (
        /* Loading State */
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Loading tasks...</p>
        </div>
      ) : todos.length === 0 ? (
        /* Empty State */
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-state-icon">
            <FiInbox size={64} />
          </div>
          <h2 className="empty-state-title">No tasks yet</h2>
          <p className="empty-state-text">
            {filters.search ||
            filters.priority ||
            filters.category ||
            filters.status
              ? 'No tasks match your filters. Try adjusting them.'
              : 'Start organizing your day by adding your first task!'}
          </p>
          {!filters.search &&
            !filters.priority &&
            !filters.category &&
            !filters.status && (
              <motion.button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPlus size={20} /> Add Your First Task
              </motion.button>
            )}
        </motion.div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <KanbanBoard
          todos={todos}
          onToggle={handleToggle}
          onDelete={(id) => setDeleteTarget(id)}
          onEdit={handleEdit}
          onUpdate={handleUpdateCard}
        />
      ) : viewMode === 'calendar' ? (
        /* Deadlines Calendar View */
        <CalendarView
          todos={todos}
          onSelectTodo={handleEdit}
        />
      ) : viewMode === 'matrix' ? (
        /* Eisenhower Matrix View */
        <div className="matrix-grid">
          {/* Quadrant 1: Urgent & Important */}
          <div className="matrix-quadrant q-urgent-important">
            <div className="matrix-quadrant-header">
              <h3 className="matrix-quadrant-title">🔴 Urgent & Important (Do First)</h3>
              <span className="matrix-quadrant-subtitle">Tasks with urgent priority</span>
            </div>
            <div className="matrix-quadrant-content">
              {todos.filter((t) => t.priority === 'urgent').length === 0 ? (
                <div className="matrix-empty-text">No urgent tasks</div>
              ) : (
                todos.filter((t) => t.priority === 'urgent').map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onDelete={(id) => setDeleteTarget(id)}
                    onEdit={handleEdit}
                    onUpdate={handleUpdateCard}
                  />
                ))
              )}
            </div>
          </div>

          {/* Quadrant 2: Important, Not Urgent */}
          <div className="matrix-quadrant q-important-noturgent">
            <div className="matrix-quadrant-header">
              <h3 className="matrix-quadrant-title">🟠 Important, Not Urgent (Schedule)</h3>
              <span className="matrix-quadrant-subtitle">Tasks with high priority</span>
            </div>
            <div className="matrix-quadrant-content">
              {todos.filter((t) => t.priority === 'high').length === 0 ? (
                <div className="matrix-empty-text">No high priority tasks</div>
              ) : (
                todos.filter((t) => t.priority === 'high').map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onDelete={(id) => setDeleteTarget(id)}
                    onEdit={handleEdit}
                    onUpdate={handleUpdateCard}
                  />
                ))
              )}
            </div>
          </div>

          {/* Quadrant 3: Urgent, Not Important */}
          <div className="matrix-quadrant q-urgent-notimportant">
            <div className="matrix-quadrant-header">
              <h3 className="matrix-quadrant-title">🟡 Urgent, Not Important (Delegate)</h3>
              <span className="matrix-quadrant-subtitle">Tasks with medium priority</span>
            </div>
            <div className="matrix-quadrant-content">
              {todos.filter((t) => t.priority === 'medium').length === 0 ? (
                <div className="matrix-empty-text">No medium priority tasks</div>
              ) : (
                todos.filter((t) => t.priority === 'medium').map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onDelete={(id) => setDeleteTarget(id)}
                    onEdit={handleEdit}
                    onUpdate={handleUpdateCard}
                  />
                ))
              )}
            </div>
          </div>

          {/* Quadrant 4: Not Urgent & Not Important */}
          <div className="matrix-quadrant q-noturgent-notimportant">
            <div className="matrix-quadrant-header">
              <h3 className="matrix-quadrant-title">🟢 Low Priority / Eliminate</h3>
              <span className="matrix-quadrant-subtitle">Tasks with low priority</span>
            </div>
            <div className="matrix-quadrant-content">
              {todos.filter((t) => t.priority === 'low').length === 0 ? (
                <div className="matrix-empty-text">No low priority tasks</div>
              ) : (
                todos.filter((t) => t.priority === 'low').map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onDelete={(id) => setDeleteTarget(id)}
                    onEdit={handleEdit}
                    onUpdate={handleUpdateCard}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Regular Todo Cards Grid */
        <motion.div
          className="todo-grid"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.08 },
            },
          }}
        >
          <AnimatePresence mode="popLayout">
            {todos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={(id) => setDeleteTarget(id)}
                onEdit={handleEdit}
                onUpdate={handleUpdateCard}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ---- Delete Confirmation Modal ---- */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </motion.div>
  );
};

export default TodoListPage;
