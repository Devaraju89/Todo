import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiUpload, FiSliders, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAllTodos, createTodo } from '../services/api';

/**
 * SettingsPage — System configurations, JSON backups, and theme customizing.
 */
const SettingsPage = () => {
  const [activeTheme, setActiveTheme] = useState('theme-amethyst');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('taskflow-theme') || 'theme-amethyst';
    setActiveTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  const changeTheme = (themeName) => {
    setActiveTheme(themeName);
    localStorage.setItem('taskflow-theme', themeName);
    document.documentElement.className = themeName;
    toast.success(`Visual theme changed! ✨`);
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
      downloadAnchor.setAttribute("download", `taskflow_db_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Database exported successfully! 📥');
    } catch (err) {
      toast.error('Failed to export database backup');
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
          toast.error('Invalid backup file. Must contain a task list array.');
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
      } catch (err) {
        toast.error('Restoration failed. Invalid JSON structure.');
        console.error(err);
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const themeOptions = [
    { id: 'theme-amethyst', name: 'Amethyst Deep', desc: 'Sleek purple gradients (Default)', accent: '#c084fc' },
    { id: 'theme-sunset', name: 'Sunset Gold', desc: 'Vibrant gold and orange tones', accent: '#fbbf24' },
    { id: 'theme-forest', name: 'Forest Emerald', desc: 'Lush organic emerald accents', accent: '#34d399' },
    { id: 'theme-obsidian', name: 'Obsidian Dark', desc: 'High-contrast steel white tones', accent: '#ffffff' },
  ];

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
          <h1 className="page-title">Application Settings</h1>
          <p className="page-subtitle">Configure theme environments and backup SQLite storage</p>
        </div>
      </div>

      <div className="todo-scroll-body" style={{ flex: 1, maxWidth: '680px', margin: '0 auto', width: '100%' }}>
        
        {/* Section 1: Themes */}
        <section className="glass-card" style={{ padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiSliders style={{ color: 'var(--accent-purple)' }} /> Visual Theme Customizer
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Switch the accent lighting system. Color settings apply globally and are stored in your browser config.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
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
        </section>

        {/* Section 2: Data Portability */}
        <section className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            📦 Data Portability & Backups
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Export all task records and checklists to a JSON file. Restore backups directly into your SQLite database.
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
        </section>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
