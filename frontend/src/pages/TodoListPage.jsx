import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiInbox,
  FiTrendingUp,
  FiGrid,
  FiSliders,
  FiDownload,
  FiUpload,
  FiCheckCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';
import FilterBar from '../components/FilterBar';
import ConfirmModal from '../components/ConfirmModal';
import KanbanBoard from '../components/KanbanBoard';
import CalendarView from '../components/CalendarView';
import PomodoroTimer from '../components/PomodoroTimer';

import {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  getStats,
} from '../services/api';

/**
 * TodoListPage — Main dashboard hub managing all todo views.
 * Complies with challenge constraints: exactly one page for the todos list.
 * Determines the rendered panel (List, Kanban, Matrix, Calendar, Focus, Analytics, Settings)
 * dynamically based on the '?view=' URL query parameter.
 */
const TodoListPage = () => {
  const [searchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'list';

  // ---- State Management ----
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    byPriority: {},
    byCategory: {},
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTheme, setActiveTheme] = useState('theme-amethyst');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    category: '',
    status: '',
    sort: 'createdAt',
  });

  // ---- Fetch Functions ----

  /** Fetch tasks list based on active filters (only applies to list view) */
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Only apply filters when we are in the main list view backlog
      if (currentView === 'list') {
        if (filters.search) params.search = filters.search;
        if (filters.priority) params.priority = filters.priority;
        if (filters.category) params.category = filters.category;
        if (filters.status) params.status = filters.status;
        if (filters.sort) params.sort = filters.sort;
      }

      const data = await getAllTodos(params);
      setTodos(Array.isArray(data) ? data : data.todos || []);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters, currentView]);

  /** Fetch aggregate statistics from backend database */
  const fetchStats = useCallback(async () => {
    try {
      const response = await getStats();
      if (response && response.success !== false) {
        setStats(response.data || response);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  // Sync state on view changes, route changes, or database update events
  useEffect(() => {
    const handleUpdate = () => {
      fetchTodos();
      fetchStats();
    };

    handleUpdate();

    // Listen to real-time custom task updates
    window.addEventListener('taskflow-update', handleUpdate);
    return () => {
      window.removeEventListener('taskflow-update', handleUpdate);
    };
  }, [fetchTodos, fetchStats]);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('taskflow-theme') || 'theme-amethyst';
    setActiveTheme(savedTheme);
  }, []);

  // ---- CRUD Operations ----

  const handleCreate = async (formData) => {
    try {
      await createTodo(formData);
      toast.success('Task created! 🎉');
      setShowForm(false);
      window.dispatchEvent(new Event('taskflow-update'));
    } catch (error) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateTodo(editingTodo.id, formData);
      toast.success('Task updated! ✨');
      setEditingTodo(null);
      window.dispatchEvent(new Event('taskflow-update'));
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleUpdateCard = async (id, updatedFields) => {
    try {
      await updateTodo(id, updatedFields);
      window.dispatchEvent(new Event('taskflow-update'));
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleTodo(id);
      window.dispatchEvent(new Event('taskflow-update'));
    } catch (error) {
      toast.error('Failed to toggle task');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTodo(deleteTarget);
      toast.success('Task deleted');
      setDeleteTarget(null);
      window.dispatchEvent(new Event('taskflow-update'));
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleCompleteFocus = async (todoId) => {
    try {
      await toggleTodo(todoId);
      window.dispatchEvent(new Event('taskflow-update'));
      toast.success('Focus session completed! 🏆');
    } catch (e) {
      toast.error('Failed to complete focus task');
    }
  };

  // ---- Settings Utilities ----

  const changeTheme = (themeName) => {
    setActiveTheme(themeName);
    localStorage.setItem('taskflow-theme', themeName);
    document.documentElement.className = themeName;
    toast.success(`Theme updated! ✨`);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await getAllTodos();
      const todosList = Array.isArray(data) ? data : data.data || data.todos || [];
      
      if (todosList.length === 0) {
        toast.error('No tasks exist to export!');
        return;
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todosList, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `taskflow_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Database backup exported! 📥');
    } catch (err) {
      toast.error('Failed to export backup');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    setImporting(true);
    reader.onload = async (event) => {
      try {
        const importedTodos = JSON.parse(event.target.result);
        const list = Array.isArray(importedTodos) ? importedTodos : importedTodos.data || [];
        
        if (!Array.isArray(list)) {
          toast.error('Invalid backup file.');
          setImporting(false);
          return;
        }

        let successCount = 0;
        for (const t of list) {
          if (t.title) {
            await createTodo({
              title: t.title,
              description: t.description || '',
              priority: t.priority || 'low',
              category: t.category || 'General',
              dueDate: t.dueDate || null,
              subtasks: t.subtasks || [],
              tags: t.tags || [],
            });
            successCount++;
          }
        }

        toast.success(`Successfully restored ${successCount} tasks! 📤`);
        window.dispatchEvent(new Event('taskflow-update'));
      } catch (err) {
        toast.error('Restoration failed.');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  // ---- Sub-View Panel Rendering ----

  const renderActiveView = () => {
    if (loading && currentView !== 'settings' && currentView !== 'focus') {
      return (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Loading dashboard panel...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'kanban':
        return (
          <KanbanBoard
            todos={todos}
            onToggle={handleToggle}
            onDelete={(id) => setDeleteTarget(id)}
            onEdit={(todo) => setEditingTodo(todo)}
            onUpdate={handleUpdateCard}
          />
        );

      case 'matrix':
        return (
          <div className="matrix-grid">
            {/* Quadrant 1: Urgent & Important */}
            <div className="matrix-quadrant q-urgent-important">
              <div className="matrix-quadrant-header">
                <h3 className="matrix-quadrant-title" style={{ color: 'var(--priority-urgent-text)' }}>🔴 Do First (Urgent & Important)</h3>
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
                <h3 className="matrix-quadrant-title" style={{ color: 'var(--priority-high-text)' }}>🟠 Schedule (Important, Not Urgent)</h3>
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
                <h3 className="matrix-quadrant-title" style={{ color: 'var(--priority-medium-text)' }}>🟡 Delegate (Urgent, Not Important)</h3>
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
                <h3 className="matrix-quadrant-title" style={{ color: 'var(--priority-low-text)' }}>🟢 Eliminate (Low Priority)</h3>
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
        );

      case 'calendar':
        return (
          <CalendarView
            todos={todos}
            onSelectTodo={(todo) => setEditingTodo(todo)}
          />
        );

      case 'focus':
        const focusPendingTodos = todos.filter((t) => !t.completed);
        return (
          <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
            <PomodoroTimer
              todos={focusPendingTodos}
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
        );

      case 'analytics':
        const score = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        const radius = 55;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (score / 100) * circumference;

        const prioritiesList = ['low', 'medium', 'high', 'urgent'];
        const priorityColors = {
          low: '#34d399',
          medium: '#fbbf24',
          high: '#fb923c',
          urgent: '#f87171',
        };

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Main Score Ring & Priority Distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* Circular Productivity Ring */}
              <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', alignSelf: 'flex-start', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiTrendingUp style={{ color: 'var(--accent-purple)' }} /> Productivity Score
                </h3>
                
                <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="150" height="150" viewBox="0 0 130 130">
                    <circle cx="65" cy="65" r={radius} stroke="rgba(255,255,255,0.02)" strokeWidth="10" fill="transparent" />
                    <circle
                      cx="65"
                      cy="65"
                      r={radius}
                      stroke="var(--accent-purple)"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s ease-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{score}%</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Completed</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '20px', maxWidth: '280px' }}>
                  {score >= 80 
                    ? 'Excellent job! You are executing your task list with high velocity.' 
                    : score >= 50 
                    ? 'Good execution. Keep working on backlog items to boost productivity.'
                    : stats.total === 0 
                    ? 'Create tasks and complete them to generate statistics.' 
                    : 'A backlog is accumulating. Select a focus target to unlock momentum.'}
                </p>
              </div>

              {/* Priority Bar Chart */}
              <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiGrid style={{ color: 'var(--accent-pink)' }} /> Priority Breakdown
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                  {prioritiesList.map((priority) => {
                    const count = stats.byPriority[priority] || 0;
                    const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={priority}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                          <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--text-secondary)' }}>{priority} Priority</span>
                          <span style={{ color: 'var(--text-muted)' }}>{count} tasks ({percent}%)</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              background: priorityColors[priority], 
                              width: `${percent}%`,
                              borderRadius: '99px'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Category Volumes Card */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                📁 Task Distribution by Category
              </h3>
              
              {Object.keys(stats.byCategory).length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                  No categories mapped yet. Create tasks with category values.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  {Object.keys(stats.byCategory).map((category) => {
                    const count = stats.byCategory[category];
                    const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={category} className="category-stat-pill" style={{ background: 'rgba(255,255,255,0.01)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{category}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{count} ({percent}%)</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              background: 'linear-gradient(90deg, var(--accent-purple) 0%, var(--accent-pink) 100%)', 
                              width: `${percent}%`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'settings':
        const themeOptions = [
          { id: 'theme-amethyst', name: 'Amethyst Deep', desc: 'Sleek purple gradients (Default)', accent: '#c084fc' },
          { id: 'theme-sunset', name: 'Sunset Gold', desc: 'Vibrant gold and orange tones', accent: '#fbbf24' },
          { id: 'theme-forest', name: 'Forest Emerald', desc: 'Lush organic emerald accents', accent: '#34d399' },
          { id: 'theme-obsidian', name: 'Obsidian Dark', desc: 'High-contrast steel white tones', accent: '#ffffff' },
        ];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '680px', margin: '0 auto', width: '100%' }}>
            
            {/* Theme switcher */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiSliders style={{ color: 'var(--accent-purple)' }} /> Visual Theme Customizer
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Select an accent lighting system. Custom color gradients apply globally.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {themeOptions.map((opt) => (
                  <div 
                    key={opt.id}
                    onClick={() => changeTheme(opt.id)}
                    className={`theme-selection-card ${activeTheme === opt.id ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: activeTheme === opt.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'var(--transition-normal)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: opt.accent, boxShadow: `0 0 10px ${opt.accent}` }} />
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'block' }}>{opt.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{opt.desc}</span>
                      </div>
                    </div>
                    {activeTheme === opt.id && (
                      <FiCheckCircle size={18} style={{ color: opt.accent }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Backups */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                📦 Data Portability & Backups
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Download all database rows to a JSON backup, or import backup files.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleExport} 
                  disabled={exporting}
                  className="btn btn-primary" 
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  <FiDownload size={16} style={{ marginRight: '6px' }} /> 
                  {exporting ? 'Exporting...' : 'Export JSON Backup'}
                </button>

                <label 
                  className="btn btn-secondary" 
                  style={{ padding: '10px 20px', fontSize: '0.85rem', cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center' }}
                >
                  <FiUpload size={16} style={{ marginRight: '6px' }} /> 
                  {importing ? 'Restoring...' : 'Restore JSON Backup'}
                  <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} disabled={importing} />
                </label>
              </div>
            </div>
          </div>
        );

      case 'list':
      default:
        return (
          <>
            {/* Sticky Filter Bar */}
            <FilterBar filters={filters} onFilterChange={setFilters} />

            {todos.length === 0 ? (
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
          </>
        );
    }
  };

  // Helper title strings
  const viewTitles = {
    list: { title: 'Tasks Backlog', subtitle: 'Manage, search, and filter your daily productivity checklist' },
    kanban: { title: 'Kanban Pipelines', subtitle: 'Track project progress visually by status columns' },
    matrix: { title: 'Eisenhower Priority Matrix', subtitle: 'Divide tasks by urgency and importance to optimize focus' },
    calendar: { title: 'Deadlines Calendar', subtitle: 'Monthly visual schedule tracking due tasks and deadlines' },
    focus: { title: 'Pomodoro Focus Zone', subtitle: 'Attach sessions to specific tasks to eliminate distractions' },
    analytics: { title: 'Productivity Insights', subtitle: 'Analyze metrics, completion rates, and focus trends' },
    settings: { title: 'Application Settings', subtitle: 'Configure theme environments and backup SQLite storage' },
  };

  const headerInfo = viewTitles[currentView] || viewTitles.list;

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header Area */}
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">{headerInfo.title}</h1>
          <p className="page-subtitle">{headerInfo.subtitle}</p>
        </div>

        {/* Global New Task Trigger */}
        <motion.button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingTodo(null);
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FiPlus size={18} />
          New Task
        </motion.button>
      </div>

      {/* Slide-in task forms */}
      <AnimatePresence>
        {showForm && (
          <TodoForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingTodo && (
          <TodoForm
            initialData={editingTodo}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTodo(null)}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area (Isolated scroll zone) */}
      <div className="todo-scroll-body">
        {renderActiveView()}
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

export default TodoListPage;
