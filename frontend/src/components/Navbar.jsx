import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckSquare, FiList } from 'react-icons/fi';

/**
 * Navbar — Glassmorphism fixed top navigation bar
 * Features gradient brand text "TaskFlow", animated nav links with active state
 */
const Navbar = () => {
  const location = useLocation();

  // Navigation link definitions
  const navLinks = [
    { path: '/todos', label: 'My Tasks', icon: <FiList /> },
  ];

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Brand Logo */}
      <Link to="/todos" className="navbar-brand">
        <motion.span
          className="brand-icon"
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <FiCheckSquare />
        </motion.span>
        <span className="gradient-text">TaskFlow</span>
      </Link>

      {/* Navigation Links */}
      <div className="nav-links">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            <span className="nav-link-icon">{link.icon}</span>
            <span className="nav-link-label">{link.label}</span>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
};

export default Navbar;
