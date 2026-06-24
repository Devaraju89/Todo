import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiInbox } from 'react-icons/fi';
import toast from 'react-hot-toast';

import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';
import FilterBar from '../components/FilterBar';
import ConfirmModal from '../components/ConfirmModal';
import {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
} from '../services/api';

/**
 * TodoListPage — Renders the standard task list backlog.
 * Handles search, complex filters, status toggles, inline editing, and task creation.
 */
const TodoListPage = () => {
  const [todos, setTodos] = useState([]);
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (formData) => {
    try {
      await createTodo(formData);
      toast.success('Task created! 🎉');
      setShowForm(false);
      fetchTodos();
    } catch (error) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateTodo(editingTodo.id, formData);
      toast.success('Task updated! ✨');
      setEditingTodo(null);
      fetchTodos();
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleUpdateCard = async (id, updatedFields) => {
    try {
      await updateTodo(id, updatedFields);
      fetchTodos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleTodo(id);
      fetchTodos();
    } catch (error) {
      toast.error('Failed to toggle task');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTodo(deleteTarget);
      toast.success('Task deleted');
      setDeleteTarget(null);
      fetchTodos();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page header and add button */}
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Tasks Backlog</h1>
          <p className="page-subtitle">Manage, search, and filter your daily productivity checklist</p>
        </div>

        <motion.button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingTodo(null);
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FiPlus size={18} />
          {showForm ? 'Cancel' : 'New Task'}
        </motion.button>
      </div>

      {/* Task Creation Panel overlay */}
      <AnimatePresence>
        {showForm && (
          <TodoForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Task Editing Panel overlay */}
      <AnimatePresence>
        {editingTodo && (
          <TodoForm
            initialData={editingTodo}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTodo(null)}
          />
        )}
      </AnimatePresence>

      {/* Filters and List scroll wrapper */}
      <div className="todo-scroll-body" style={{ flex: 1, paddingRight: '8px' }}>
        
        {/* Sticky filter bar */}
        <FilterBar filters={filters} onFilterChange={setFilters} />

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p className="loading-text">Loading backlog tasks...</p>
          </div>
        ) : todos.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="empty-state-icon">
              <FiInbox size={48} />
            </div>
            <h3 className="empty-state-title">No tasks found</h3>
            <p className="empty-state-text">
              {filters.search || filters.priority || filters.category || filters.status
                ? 'No tasks match your filter configurations. Try adjusting them.'
                : 'Create your first productivity task to begin organizing!'}
            </p>
            {!filters.search && !filters.priority && !filters.category && !filters.status && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <FiPlus size={16} style={{ marginRight: '6px' }} /> Create Task
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="todo-grid"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.05 },
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
                  onEdit={(t) => setEditingTodo(t)}
                  onUpdate={handleUpdateCard}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Delete confirmation modal */}
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
