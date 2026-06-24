import { motion } from 'framer-motion';
import { FiList, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useState, useEffect } from 'react';

/**
 * StatsPanel — Row of animated glassmorphism stat cards
 * Shows Total, Completed, Pending, and Overdue counts
 * with animated counters and circular progress indicator
 */
const StatsPanel = ({ stats }) => {
  /**
   * AnimatedCounter — Smoothly animates a number from 0 to target value
   * Uses requestAnimationFrame with easeOutCubic easing
   */
  const AnimatedCounter = ({ value, duration = 1000 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      if (value === 0) {
        setDisplayValue(0);
        return;
      }

      let startTime;
      let animationFrame;
      const startValue = 0;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        setDisplayValue(Math.round(startValue + (value - startValue) * eased));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
      };
    }, [value, duration]);

    return <span>{displayValue}</span>;
  };

  // Calculate completion percentage
  const completionRate =
    stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;

  // SVG circle parameters for progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (completionRate / 100) * circumference;

  // Stat card definitions
  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.total || 0,
      icon: <FiList size={24} />,
      color: 'var(--accent-cyan)',
    },
    {
      label: 'Completed',
      value: stats.completed || 0,
      icon: <FiCheckCircle size={24} />,
      color: 'var(--priority-low)',
    },
    {
      label: 'Pending',
      value: stats.pending || 0,
      icon: <FiClock size={24} />,
      color: 'var(--priority-medium)',
    },
    {
      label: 'Overdue',
      value: stats.overdue || 0,
      icon: <FiAlertCircle size={24} />,
      color: 'var(--priority-urgent)',
    },
  ];

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="stats-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stat Cards Grid */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            className="stat-card glass-card"
            variants={cardVariants}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="stat-icon" style={{ color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-value" style={{ color: card.color }}>
              <AnimatedCounter value={card.value} />
            </div>
            <div className="stat-label">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Circular Progress Indicator */}
      {stats.total > 0 && (
        <motion.div
          className="progress-ring-container"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <svg className="progress-ring" width="76" height="76">
            {/* Background Circle */}
            <circle
              className="progress-ring-bg"
              cx="38"
              cy="38"
              r={radius}
              fill="none"
              stroke="var(--glass-border)"
              strokeWidth="4"
            />
            {/* Animated Progress Circle */}
            <motion.circle
              className="progress-ring-fill"
              cx="38"
              cy="38"
              r={radius}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              transform="rotate(-90 38 38)"
            />
            {/* Gradient Definition */}
            <defs>
              <linearGradient
                id="progressGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="var(--accent-purple)" />
                <stop offset="100%" stopColor="var(--accent-cyan)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="progress-ring-text">
            <span className="progress-ring-value">{completionRate}%</span>
            <span className="progress-ring-label">Done</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatsPanel;
