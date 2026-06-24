import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import CalendarView from '../components/CalendarView';
import TodoForm from '../components/TodoForm';
import { getAllTodos, updateTodo } from '../services/api';

/**
 * CalendarPage — Monthly calendar dashboard showing task deadlines.
 */
const CalendarPage = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await getAllTodos();
      setTodos(Array.isArray(data) ? data : data.todos || []);
    } catch (e) {
      toast.error('Failed to load calendar deadlines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

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
          <h1 className="page-title">Deadlines Calendar</h1>
          <p className="page-subtitle">Monthly visual schedule tracking due tasks and deadlines</p>
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

      <div className="todo-scroll-body" style={{ flex: 1, paddingRight: '0' }}>
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p className="loading-text">Generating calendar grids...</p>
          </div>
        ) : (
          <CalendarView
            todos={todos}
            onSelectTodo={(todo) => setEditingTodo(todo)}
          />
        )}
      </div>
    </motion.div>
  );
};

export default CalendarPage;
