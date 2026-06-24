import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiList,
  FiColumns,
  FiGrid,
  FiCalendar,
  FiClock,
  FiBarChart2,
  FiSettings,
} from 'react-icons/fi';

/**
 * Sidebar — Pinned vertical navigation drawer.
 * Displays application links with query parameters for view states.
 */
const Sidebar = () => {
  const location = useLocation();

  // Extract current view parameter
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get('view') || 'list';

  // Define navigation routes and menu items using query params
  const menuItems = [
    { path: '/todos', view: 'list', label: 'Tasks List', icon: <FiList size={18} /> },
    { path: '/todos?view=kanban', view: 'kanban', label: 'Kanban Board', icon: <FiColumns size={18} /> },
    { path: '/todos?view=matrix', view: 'matrix', label: 'Eisenhower Matrix', icon: <FiGrid size={18} /> },
    { path: '/todos?view=calendar', view: 'calendar', label: 'Deadlines Calendar', icon: <FiCalendar size={18} /> },
    { path: '/todos?view=focus', view: 'focus', label: 'Focus Zone', icon: <FiClock size={18} /> },
    { path: '/todos?view=analytics', view: 'analytics', label: 'Analytics', icon: <FiBarChart2 size={18} /> },
    { path: '/todos?view=settings', view: 'settings', label: 'Settings', icon: <FiSettings size={18} /> },
  ];

  return (
    <aside className="app-sidebar glass-card">
      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const isActive = location.pathname === '/todos' && currentView === item.view;
          return (
            <Link
              key={item.view}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-link-icon-wrapper">
                {item.icon}
              </div>
              <span className="sidebar-link-label">{item.label}</span>
              {isActive && (
                <motion.div
                  className="sidebar-active-indicator"
                  layoutId="sidebarActiveIndicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-system-info">
          <span className="system-status-indicator"></span>
          <span className="system-status-text">Cloud Sync Enabled</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
