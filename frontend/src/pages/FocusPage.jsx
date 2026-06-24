import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import PomodoroTimer from '../components/PomodoroTimer';
import { getAllTodos, toggleTodo } from '../services/api';

/**
 * FocusPage — Implements the Pomodoro Focus Zone.
 * Connects the timer directly to SQLite tasks to mark them completed.
 */
const FocusPage = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllTodos({ completed: 0 }); // Only show pending tasks to focus on
      setTodos(Array.isArray(data) ? data : data.todos || []);
    } catch (e) {
      toast.error('Failed to load pending tasks for focus zone');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCompleteFocus = async (todoId) => {
    try {
      await toggleTodo(todoId);
      fetchTodos();
      toast.success('Outstanding! Task completed via focus session! 🏆');
    } catch (e) {
      toast.error('Failed to complete focus task');
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
          <h1 className="page-title">Pomodoro Focus Zone</h1>
          <p className="page-subtitle">Attach sessions to specific tasks to eliminate distractions</p>
        </div>
      </div>

      <div className="todo-scroll-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '400px' }}>
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p className="loading-text">Loading focus zone...</p>
          </div>
        ) : (
          <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
            <PomodoroTimer
              todos={todos}
              onCompleteFocus={handleCompleteFocus}
            />
            
            <div className="glass-card" style={{ marginTop: '24px', padding: '20px', borderRadius: '16px', background: 'rgba(0,0,0,0.1)' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>💡 Focus Zone Guidelines</h4>
              <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <li>Select a task from your current backlog list.</li>
                <li>Start the 25-minute Pomodoro focus timer.</li>
                <li>Work strictly on that single task until the time runs out.</li>
                <li>Take a 5-minute break when the alarm goes off.</li>
                <li>The system will automatically check off the task once the session is completed!</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FocusPage;
