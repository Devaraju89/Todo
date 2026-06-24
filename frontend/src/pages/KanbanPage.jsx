import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import KanbanBoard from '../components/KanbanBoard';
import TodoForm from '../components/TodoForm';
import ConfirmModal from '../components/ConfirmModal';
import { getAllTodos, updateTodo, toggleTodo, deleteTodo } from '../services/api';

/**
 * KanbanPage — Dedicated view for Kanban Board.
 * Connects directly to backend API and manages card mutations.
 */
const KanbanPage = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllTodos();
      setTodos(Array.isArray(data) ? data : data.todos || []);
    } catch (error) {
      toast.error('Failed to load tasks for Kanban');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleToggle = async (id) => {
    try {
      await toggleTodo(id);
      fetchTodos();
      window.dispatchEvent(new Event('taskflow-update'));
    } catch (e) {
      toast.error('Failed to toggle task');
    }
  };

  const handleUpdateCard = async (id, updatedFields) => {
    try {
      await updateTodo(id, updatedFields);
      fetchTodos();
      toast.success('Task moved successfully! 🗂️');
      window.dispatchEvent(new Event('taskflow-update'));
    } catch (error) {
      toast.error('Failed to update task status');
      console.error(error);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateTodo(editingTodo.id, formData);
      toast.success('Task updated! ✨');
      setEditingTodo(null);
      fetchTodos();
      window.dispatchEvent(new Event('taskflow-update'));
    } catch (e) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTodo(deleteTarget);
      toast.success('Task deleted');
      setDeleteTarget(null);
      fetchTodos();
      window.dispatchEvent(new Event('taskflow-update'));
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
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Kanban Pipelines</h1>
          <p className="page-subtitle">Track project progress visually by status columns</p>
        </div>
      </div>

      {/* Edit Form Popup */}
      <AnimatePresence>
        {editingTodo && (
          <TodoForm
            initialData={editingTodo}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTodo(null)}
          />
        )}
      </AnimatePresence>

      <div className="todo-scroll-body" style={{ flex: 1, paddingRight: '0', overflowY: 'hidden' }}>
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p className="loading-text">Loading Kanban board...</p>
          </div>
        ) : (
          <KanbanBoard
            todos={todos}
            onToggle={handleToggle}
            onDelete={(id) => setDeleteTarget(id)}
            onEdit={(todo) => setEditingTodo(todo)}
            onUpdate={handleUpdateCard}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
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

export default KanbanPage;
