import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiDatabase, FiCpu, FiCheckCircle } from 'react-icons/fi';
import { getStats } from '../services/api';

/**
 * Footer — Pinned bottom status bar spanning the full width of the viewport.
 * Provides system diagnostics and a task completion progress bar.
 */
const Footer = () => {
  const location = useLocation();
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [dbStatus, setDbStatus] = useState('Online');

  // Fetch stats on mount, route changes, or database updates
  useEffect(() => {
    const fetchLatestStats = async () => {
      try {
        const response = await getStats();
        if (response && response.success !== false) {
          const statsData = response.data || response;
          setStats({
            total: statsData.total || 0,
            completed: statsData.completed || 0,
          });
          setDbStatus('Connected');
        }
      } catch (err) {
        console.error('Failed to load footer stats:', err);
        setDbStatus('Error');
      }
    };

    fetchLatestStats();

    // Subscribe to task updates
    window.addEventListener('taskflow-update', fetchLatestStats);
    return () => {
      window.removeEventListener('taskflow-update', fetchLatestStats);
    };
  }, [location.pathname]);

  const completionPercent = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <footer className="app-footer glass-card">
      {/* Database connection node diagnostics */}
      <div className="footer-status-node">
        <FiDatabase className="footer-status-icon db-icon" />
        <span className="status-label">SQLite:</span>
        <span className={`status-value ${dbStatus.toLowerCase()}`}>{dbStatus}</span>
      </div>

      {/* Visual task completion tracker progress bar */}
      <div className="footer-progress-wrapper" title="Overall completion progress">
        <FiCheckCircle className="footer-progress-icon" />
        <span className="footer-progress-label">Today's Progress:</span>
        <div className="footer-progress-track">
          <div 
            className="footer-progress-fill" 
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <span className="footer-progress-percent">{completionPercent}% ({stats.completed}/{stats.total})</span>
      </div>

      {/* Local server diagnostics and app version */}
      <div className="footer-system-node">
        <FiCpu className="footer-status-icon sys-icon" />
        <span className="system-node-label">Environment:</span>
        <span className="system-node-value">React 18 & Express</span>
        <span className="system-version">v1.2.0</span>
      </div>
    </footer>
  );
};

export default Footer;
