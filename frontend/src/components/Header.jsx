import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiCheckSquare, FiUser, FiBarChart2, FiAward, FiAlertCircle } from 'react-icons/fi';
import { getStats } from '../services/api';

/**
 * Header — Pinned top bar spanning 100% width of the viewport.
 * Provides global branding, live metrics tracking, and user profile information.
 */
const Header = () => {
  const location = useLocation();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });

  // Fetch stats on mount, route changes, or database updates
  useEffect(() => {
    const fetchLatestStats = async () => {
      try {
        const response = await getStats();
        if (response && response.success !== false) {
          const statsData = response.data || response;
          setStats(statsData);
        }
      } catch (err) {
        console.error('Failed to load header stats:', err);
      }
    };

    fetchLatestStats();

    // Subscribe to task updates
    window.addEventListener('taskflow-update', fetchLatestStats);
    return () => {
      window.removeEventListener('taskflow-update', fetchLatestStats);
    };
  }, [location.pathname]);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="app-header glass-card">
      {/* Brand area */}
      <Link to="/todos" className="header-brand">
        <div className="header-logo">
          <FiCheckSquare size={24} />
        </div>
        <div className="header-brand-text">
          <span className="logo-text-gradient">TaskFlow</span>
          <span className="logo-tag">PRO</span>
        </div>
      </Link>

      {/* Global Live Stats Metrics */}
      <div className="header-metrics-bar">
        <div className="metric-pill total" title="Total Tasks">
          <span className="metric-icon"><FiBarChart2 size={13} /></span>
          <span className="metric-label">Total</span>
          <span className="metric-count">{stats.total}</span>
        </div>

        <div className="metric-pill pending" title="Pending Tasks">
          <span className="metric-icon"><FiAward size={13} /></span>
          <span className="metric-label">Pending</span>
          <span className="metric-count">{stats.pending}</span>
        </div>

        <div className="metric-pill completed" title="Completed Tasks">
          <span className="metric-icon"><FiCheckSquare size={13} /></span>
          <span className="metric-label">Done</span>
          <span className="metric-count">{stats.completed}</span>
        </div>

        <div className="metric-pill overdue" title="Overdue Tasks">
          <span className="metric-icon"><FiAlertCircle size={13} /></span>
          <span className="metric-label">Overdue</span>
          <span className="metric-count">{stats.overdue}</span>
        </div>
      </div>

      {/* Right profile panel */}
      <div className="header-right-panel">
        <div className="header-date-tag">
          <span>{todayStr}</span>
        </div>

        <div className="header-profile">
          <div className="profile-details">
            <span className="profile-name">Devaraju</span>
            <span className="profile-role">Productivity Pro</span>
          </div>
          <div className="profile-avatar">
            <FiUser size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
