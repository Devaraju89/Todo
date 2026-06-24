import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiTrash2,
  FiEdit3,
  FiCalendar,
  FiClock,
} from 'react-icons/fi';

/**
 * TodoCard — Spatial glassmorphism card for individual todo items
 * Features priority-colored left border, animated checkbox,
 * hover lift effect, and contextual overdue indicators
 */
const TodoCard = ({ todo, onToggle, onDelete, onEdit }) => {
  const navigate = useNavigate();

  // Format the due date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Check if the todo is overdue
  const isOverdue = () => {
    if (!todo.dueDate || todo.completed) return false;
    return new Date(todo.dueDate) < new Date();
  };

  // Get priority class for border color
  const priorityClass = `priority-${todo.priority || 'low'}`;

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className={`todo-card ${priorityClass} ${todo.completed ? 'completed' : ''} ${isOverdue() ? 'overdue' : ''}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      {/* Card Header: Checkbox + Title */}
      <div className="todo-card-header">
        <div className="todo-card-header-left">
          <motion.input
            type="checkbox"
            className="custom-checkbox"
            checked={todo.completed || false}
            onChange={() => onToggle(todo.id)}
            whileTap={{ scale: 0.85 }}
          />
          <h3
            className={`todo-card-title ${todo.completed ? 'completed' : ''}`}
            onClick={() => navigate(`/todo?id=${todo.id}`)}
          >
            {todo.title}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="todo-card-actions">
          <motion.button
            className="btn btn-icon"
            onClick={() => onEdit(todo)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Edit"
          >
            <FiEdit3 size={16} />
          </motion.button>
          <motion.button
            className="btn btn-icon btn-icon-danger"
            onClick={() => onDelete(todo.id)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Delete"
          >
            <FiTrash2 size={16} />
          </motion.button>
        </div>
      </div>

      {/* Description (truncated) */}
      {todo.description && (
        <p className="todo-card-description">{todo.description}</p>
      )}

      {/* Card Footer: Badges & Meta */}
      <div className="todo-card-footer">
        {/* Priority Badge */}
        <span className={`badge badge-${todo.priority || 'low'}`}>
          {todo.priority || 'low'}
        </span>

        {/* Category Chip */}
        {todo.category && (
          <span className="chip">{todo.category}</span>
        )}

        {/* Due Date */}
        {todo.dueDate && (
          <span className={`todo-card-date ${isOverdue() ? 'overdue-text' : ''}`}>
            <FiCalendar size={12} />
            {formatDate(todo.dueDate)}
          </span>
        )}

        {/* Overdue Indicator */}
        {isOverdue() && (
          <span className="overdue-badge">
            <FiClock size={12} />
            Overdue
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default TodoCard;
