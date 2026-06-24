import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';
import ConfirmModal from '../components/ConfirmModal';
import { getAllTodos, updateTodo, toggleTodo, deleteTodo } from '../services/api';

/**
 * MatrixPage — Renders a structured Eisenhower Matrix grid (2x2).
 * Categorizes tasks dynamically based on their priority tag.
 */
const MatrixPage = () => {
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
      toast.error('Failed to load matrix tasks');
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
    } catch (e) {
      toast.error('Failed to toggle task');
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

  const handleUpdate = async (formData) => {
    try {
      await updateTodo(editingTodo.id, formData);
      toast.success('Task updated! ✨');
      setEditingTodo(null);
      fetchTodos();
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
          <h1 className="page-title">Eisenhower Priority Matrix</h1>
          <p className="page-subtitle">Divide tasks by urgency and importance to optimize focus</p>
        </div>
      </div>

      <AnimatePresence>
        {editingTodo && (
          <TodoForm
            initialData={editingTodo}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTodo(null)}
          />
        )}
      </AnimatePresence>

      <div className="todo-scroll-body" style={{ flex: 1, paddingRight: '4px' }}>
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p className="loading-text">Organizing matrix grid...</p>
          </div>
        ) : (
          <div className="matrix-grid">
            {/* Quadrant 1: Urgent & Important */}
            <div className="matrix-quadrant q-urgent-important">
              <div className="matrix-quadrant-header">
                <h3 className="matrix-quadrant-title">🔴 Do First (Urgent & Important)</h3>
                <span className="matrix-quadrant-subtitle">Urgent priorities</span>
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
                      onEdit={(t) => setEditingTodo(t)}
                      onUpdate={handleUpdateCard}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Quadrant 2: Important, Not Urgent */}
            <div className="matrix-quadrant q-important-noturgent">
              <div className="matrix-quadrant-header">
                <h3 className="matrix-quadrant-title">🟠 Schedule (Important, Not Urgent)</h3>
                <span className="matrix-quadrant-subtitle">High priorities</span>
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
                      onEdit={(t) => setEditingTodo(t)}
                      onUpdate={handleUpdateCard}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Quadrant 3: Urgent, Not Important */}
            <div className="matrix-quadrant q-urgent-notimportant">
              <div className="matrix-quadrant-header">
                <h3 className="matrix-quadrant-title">🟡 Delegate (Urgent, Not Important)</h3>
                <span className="matrix-quadrant-subtitle">Medium priorities</span>
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
                      onEdit={(t) => setEditingTodo(t)}
                      onUpdate={handleUpdateCard}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Quadrant 4: Not Urgent & Not Important */}
            <div className="matrix-quadrant q-noturgent-notimportant">
              <div className="matrix-quadrant-header">
                <h3 className="matrix-quadrant-title">🟢 Eliminate (Low Priority)</h3>
                <span className="matrix-quadrant-subtitle">Low priorities</span>
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
                      onEdit={(t) => setEditingTodo(t)}
                      onUpdate={handleUpdateCard}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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

export default MatrixPage;
