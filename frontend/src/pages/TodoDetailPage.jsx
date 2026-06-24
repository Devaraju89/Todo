import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCircle,
  FiEdit3,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiTag,
  FiFlag,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import TodoForm from '../components/TodoForm';
import ConfirmModal from '../components/ConfirmModal';
import { getTodoById, updateTodo, deleteTodo, toggleTodo } from '../services/api';

/**
 * TodoDetailPage — Full detail view for a single todo item
 * Features: large spatial card, relative dates, inline editing,
 * status toggle, deletion with confirm, and animated transitions
 */
const TodoDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');

  // ---- State ----
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ---- Fetch todo data ----
  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchTodo = async () => {
      try {
        setLoading(true);
        const data = await getTodoById(id);
        if (data) {
          setTodo(data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Failed to fetch todo:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTodo();
  }, [id]);

  // ---- Date Helpers ----

  /** Get a human-readable relative time string */
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1) return `${diffDays} days from now`;
    return `Overdue by ${Math.abs(diffDays)} days`;
  };

  /** Format a date for full display */
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /** Format a timestamp with time */
  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if overdue
  const isOverdue =
    todo?.dueDate && !todo?.completed && new Date(todo.dueDate) < new Date();

  // ---- Actions ----

  /** Toggle completion status */
  const handleToggle = async () => {
    try {
      const updated = await toggleTodo(id);
      setTodo(updated);
      toast.success(
        updated.completed ? 'Task completed! 🎉' : 'Task marked as pending'
      );
    } catch (error) {
      toast.error('Failed to toggle task');
    }
  };

  /** Update the todo */
  const handleUpdate = async (formData) => {
    try {
      const updated = await updateTodo(id, formData);
      setTodo(updated);
      setIsEditing(false);
      toast.success('Task updated! ✨');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  /** Toggle subtask checkbox status on detail page */
  const handleToggleSubtask = async (subtaskId) => {
    try {
      const updatedSubtasks = todo.subtasks.map((s) => {
        if (s.id === subtaskId) {
          return { ...s, completed: !s.completed };
        }
        return s;
      });
      const updated = await updateTodo(id, { subtasks: updatedSubtasks });
      setTodo(updated);
    } catch (error) {
      toast.error('Failed to update subtask');
    }
  };

  /** Delete the todo */
  const handleDelete = async () => {
    try {
      await deleteTodo(id);
      toast.success('Task deleted');
      navigate('/todos');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, x: 30 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    exit: { opacity: 0, x: -30, transition: { duration: 0.3 } },
  };

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Loading task details...</p>
        </div>
      </div>
    );
  }

  // ---- Not Found State ----
  if (notFound) {
    return (
      <motion.div
        className="page-container"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h2 className="empty-state-title">Task Not Found</h2>
          <p className="empty-state-text">
            The task you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <motion.button
            className="btn btn-primary"
            onClick={() => navigate('/todos')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft size={18} /> Back to Tasks
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ---- Main Detail View ----
  return (
    <motion.div
      className="page-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Back Button */}
      <motion.button
        className="btn btn-secondary mb-3"
        onClick={() => navigate('/todos')}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiArrowLeft size={18} /> Back to Tasks
      </motion.button>

      {/* Edit Form (inline) */}
      <AnimatePresence>
        {isEditing && (
          <TodoForm
            initialData={todo}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </AnimatePresence>

      {/* Detail Card */}
      {!isEditing && (
        <motion.div
          className={`detail-card glass-card ${isOverdue ? 'overdue' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Title */}
          <h1 className={`detail-title ${todo.completed ? 'completed' : ''}`}>
            {todo.title}
          </h1>

          {/* Meta Badges */}
          <div className="detail-meta">
            {/* Priority Badge */}
            <span className={`badge badge-${todo.priority || 'low'}`}>
              <FiFlag size={12} /> {todo.priority || 'Low'}
            </span>

            {/* Category Chip */}
            {todo.category && (
              <span className="chip">
                <FiTag size={12} /> {todo.category}
              </span>
            )}

            {/* Status Badge */}
            <span
              className={`badge ${
                todo.completed ? 'badge-completed' : 'badge-pending'
              }`}
            >
              {todo.completed ? (
                <>
                  <FiCheckCircle size={12} /> Completed
                </>
              ) : (
                <>
                  <FiCircle size={12} /> Pending
                </>
              )}
            </span>
          </div>

          {/* Description */}
          {todo.description && (
            <div className="detail-description">
              <h3 className="detail-section-title">Description</h3>
              <p>{todo.description}</p>
            </div>
          )}

          {/* Due Date */}
          {todo.dueDate && (
            <div className="detail-due-date">
              <h3 className="detail-section-title">
                <FiCalendar size={16} /> Due Date
              </h3>
              <p className="detail-date-value">{formatDate(todo.dueDate)}</p>
              <p
                className={`detail-date-relative ${
                  isOverdue ? 'overdue-text' : ''
                }`}
              >
                <FiClock size={14} /> {getRelativeTime(todo.dueDate)}
              </p>
            </div>
          )}

          {/* Subtasks Section */}
          {todo.subtasks && todo.subtasks.length > 0 && (
            <div className="detail-description" style={{ marginTop: '24px' }}>
              <h3 className="detail-section-title">Subtasks Checklist</h3>
              <div className="subtasks-list" style={{ marginTop: '12px' }}>
                {todo.subtasks.map((sub) => (
                  <div key={sub.id} className="subtask-item" style={{ background: 'rgba(255,255,255,0.01)', padding: '10px 14px' }}>
                    <div className="subtask-item-left">
                      <input
                        type="checkbox"
                        className="custom-checkbox"
                        checked={sub.completed}
                        onChange={() => handleToggleSubtask(sub.id)}
                        style={{ marginRight: '10px' }}
                      />
                      <span className={`subtask-text ${sub.completed ? 'completed' : ''}`}>
                        {sub.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Section */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="detail-description" style={{ marginTop: '24px' }}>
              <h3 className="detail-section-title">Tags</h3>
              <div className="todo-tags-container" style={{ marginTop: '12px' }}>
                {todo.tags.map((tag) => (
                  <span key={tag} className="tag-badge" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="detail-timestamps">
            <p>Created: {formatTimestamp(todo.createdAt)}</p>
            {todo.updatedAt && (
              <p>Updated: {formatTimestamp(todo.updatedAt)}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="detail-actions">
            <motion.button
              className={`btn ${
                todo.completed ? 'btn-secondary' : 'btn-primary'
              }`}
              onClick={handleToggle}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {todo.completed ? (
                <>
                  <FiCircle size={18} /> Mark Pending
                </>
              ) : (
                <>
                  <FiCheckCircle size={18} /> Mark Complete
                </>
              )}
            </motion.button>

            <motion.button
              className="btn btn-secondary"
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiEdit3 size={18} /> Edit
            </motion.button>

            <motion.button
              className="btn btn-danger"
              onClick={() => setShowDeleteModal(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiTrash2 size={18} /> Delete
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        title="Delete Task"
        message={`Are you sure you want to delete "${todo?.title}"? This action cannot be undone.`}
      />
    </motion.div>
  );
};

export default TodoDetailPage;
