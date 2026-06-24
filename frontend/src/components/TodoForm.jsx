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

  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');

  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

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
      setSubtasks(initialData.subtasks || []);
      setTags(initialData.tags || []);
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

  // Subtask Add/Remove handlers
  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      setSubtasks((prev) => [
        ...prev,
        { id: Math.random().toString(), text: newSubtask.trim(), completed: false },
      ]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (id, e) => {
    e.preventDefault();
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  // Tag Add/Remove handlers
  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags((prev) => [...prev, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove, e) => {
    e.preventDefault();
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Validate and submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate title
    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    onSubmit({
      ...formData,
      subtasks,
      tags,
    });

    // Reset form if not editing
    if (!isEditMode) {
      setFormData({
        title: '',
        description: '',
        priority: 'low',
        category: 'General',
        dueDate: '',
      });
      setSubtasks([]);
      setTags([]);
    }
  };

  // Category options
  const categories = ['General', 'Work', 'Personal', 'Health', 'Finance', 'Learning'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  // Form modal animations
  const formVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', duration: 0.4 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="confirm-modal-backdrop" style={{ padding: '20px' }}>
      <motion.div
        className="todo-form-panel"
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 0,
        }}
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
          <div className="todo-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
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

            <div className="form-group" style={{ marginBottom: 0 }}>
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

            <div className="form-group" style={{ marginBottom: 0 }}>
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

          {/* Subtasks Section */}
          <div className="subtasks-section" style={{ marginBottom: '20px' }}>
            <label className="form-label">Subtasks Checklist</label>
            <div className="input-with-button" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add a step to this task..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddSubtask}
                style={{ margin: 0, whiteSpace: 'nowrap' }}
              >
                + Add Step
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="subtasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '12px' }}>
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="subtask-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '6px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="subtask-item-left">
                      <span className="subtask-text" style={{ fontSize: '0.82rem' }}>{subtask.text}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-icon text-danger"
                      onClick={(e) => handleRemoveSubtask(subtask.id, e)}
                      style={{ padding: '4px' }}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="tags-section" style={{ marginBottom: '24px' }}>
            <label className="form-label">Tags / Labels</label>
            <div className="input-with-button" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. bug, quick, documentation..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(e);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddTag}
                style={{ margin: 0, whiteSpace: 'nowrap' }}
              >
                + Tag
              </button>
            </div>

            {tags.length > 0 && (
              <div className="tags-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {tags.map((tag) => (
                  <span key={tag} className="tag-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                    #{tag}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveTag(tag, e)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="todo-form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
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
    </div>
  );
};

export default TodoForm;
