import { motion } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';

/**
 * FilterBar — Glassmorphism horizontal filter bar
 * Provides search, priority, category, status, and sort controls
 */
const FilterBar = ({ filters, onFilterChange }) => {
  // Handle individual filter changes
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  // Clear all filters to defaults
  const clearFilters = () => {
    onFilterChange({
      search: '',
      priority: '',
      category: '',
      status: '',
      sort: 'createdAt',
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.search ||
    filters.priority ||
    filters.category ||
    filters.status ||
    filters.sort !== 'createdAt';

  return (
    <motion.div
      className="filter-bar"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Search Input */}
      <div className="search-input-wrapper">
        <FiSearch className="search-icon" size={18} />
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search tasks..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>

      {/* Priority Filter */}
      <select
        className="form-select filter-select"
        value={filters.priority || ''}
        onChange={(e) => handleChange('priority', e.target.value)}
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      {/* Category Filter */}
      <select
        className="form-select filter-select"
        value={filters.category || ''}
        onChange={(e) => handleChange('category', e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="General">General</option>
        <option value="Work">Work</option>
        <option value="Personal">Personal</option>
        <option value="Health">Health</option>
        <option value="Finance">Finance</option>
        <option value="Learning">Learning</option>
      </select>

      {/* Status Filter */}
      <select
        className="form-select filter-select"
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>

      {/* Sort */}
      <select
        className="form-select filter-select"
        value={filters.sort || 'createdAt'}
        onChange={(e) => handleChange('sort', e.target.value)}
      >
        <option value="createdAt">Created Date</option>
        <option value="dueDate">Due Date</option>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
      </select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <motion.button
          className="btn btn-secondary btn-sm"
          onClick={clearFilters}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiX size={14} /> Clear
        </motion.button>
      )}
    </motion.div>
  );
};

export default FilterBar;
