import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiSave } from 'react-icons/fi';

/**
 * TodoForm — Glassmorphism floating form panel for creating/editing todos
 * Features animated expand/collapse, validation, and spatial depth
 */
const TodoForm = ({ onSubmit, initialData = null, onCancel }) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'low',
    category: 'General',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'low',
        category: initialData.category || 'General',
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : '',
      });
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate and submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate title
    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    onSubmit(formData);

    // Reset form if not editing
    if (!isEditMode) {
      setFormData({
        title: '',
        description: '',
        priority: 'low',
        category: 'General',
        dueDate: '',
      });
    }
  };

  // Category options
  const categories = ['General', 'Work', 'Personal', 'Health', 'Finance', 'Learning'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  // Form animation variants
  const formVariants = {
    hidden: { opacity: 0, height: 0, marginBottom: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      marginBottom: 24,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      height: 0,
      marginBottom: 0,
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  };

  return (
    <motion.div
      className="todo-form-panel"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="todo-form-header">
        <h2 className="todo-form-title">
          {isEditMode ? 'Edit Task' : 'Create New Task'}
        </h2>
        {onCancel && (
          <motion.button
            className="btn btn-icon"
            onClick={onCancel}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX size={20} />
          </motion.button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Title Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="title">
            Task Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={handleChange}
            autoFocus
          />
          <AnimatePresence>
            {errors.title && (
              <motion.span
                className="form-error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                {errors.title}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            placeholder="Add some details..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {/* Grid: Priority, Category, Due Date */}
        <div className="todo-form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleChange}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dueDate">
              Due Date
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className="form-input"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="todo-form-actions">
          {onCancel && (
            <motion.button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Cancel
            </motion.button>
          )}
          <motion.button
            type="submit"
            className="btn btn-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isEditMode ? (
              <>
                <FiSave size={18} /> Update Task
              </>
            ) : (
              <>
                <FiPlus size={18} /> Add Task
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default TodoForm;
