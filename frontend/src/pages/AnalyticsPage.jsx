import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiActivity, FiGrid, FiList, FiAlertCircle, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getStats } from '../services/api';

/**
 * AnalyticsPage — Productivity dashboards and stats analysis.
 * Uses CSS bars and interactive SVG gauges for high-performance visual graphs.
 */
const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        setLoading(true);
        const data = await getStats();
        if (data && data.success !== false) {
          setStats(data.data || data);
        }
      } catch (err) {
        toast.error('Failed to load productivity metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchStatsData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Analyzing database records...</p>
        </div>
      </div>
    );
  }

  // Fallback default statistics
  const {
    total = 0,
    completed = 0,
    pending = 0,
    overdue = 0,
    byPriority = {},
    byCategory = {},
  } = stats || {};

  const score = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdueRate = total > 0 ? Math.round((overdue / total) * 100) : 0;

  // SVG parameters
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Format priority keys
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const priorityColors = {
    low: '#34d399',
    medium: '#fbbf24',
    high: '#fb923c',
    urgent: '#f87171',
  };

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
          <h1 className="page-title">Productivity Insights</h1>
          <p className="page-subtitle">Analyze metrics, completion rates, and focus trends</p>
        </div>
      </div>

      <div className="todo-scroll-body" style={{ flex: 1, paddingRight: '8px' }}>
        {/* Row 1: Quick Stats Cards */}
        <div className="analytics-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="glass-card stat-detail-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="analytics-icon-box" style={{ background: 'rgba(192, 132, 252, 0.1)', color: 'var(--accent-purple)', padding: '12px', borderRadius: '12px' }}>
              <FiList size={22} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total Tasks</span>
              <strong style={{ fontSize: '1.6rem', color: '#fff' }}>{total}</strong>
            </div>
          </div>

          <div className="glass-card stat-detail-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="analytics-icon-box" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '12px', borderRadius: '12px' }}>
              <FiAward size={22} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Completed</span>
              <strong style={{ fontSize: '1.6rem', color: '#fff' }}>{completed}</strong>
            </div>
          </div>

          <div className="glass-card stat-detail-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="analytics-icon-box" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', padding: '12px', borderRadius: '12px' }}>
              <FiActivity size={22} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Pending</span>
              <strong style={{ fontSize: '1.6rem', color: '#fff' }}>{pending}</strong>
            </div>
          </div>

          <div className="glass-card stat-detail-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="analytics-icon-box" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', padding: '12px', borderRadius: '12px' }}>
              <FiAlertCircle size={22} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Overdue</span>
              <strong style={{ fontSize: '1.6rem', color: '#fff' }}>{overdue}</strong>
            </div>
          </div>
        </div>

        {/* Row 2: Main score rings & priority charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          {/* Circular Score Gauge */}
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
                ? 'Legendary execution rate! You are dominating your task backlog.' 
                : score >= 50 
                ? 'Making steady progress. Keep ticking off tasks to boost your score.'
                : total === 0 
                ? 'Create tasks and complete them to generate statistics.' 
                : 'Backlog is accumulating. Try scheduling some focus sessions.'}
            </p>
          </div>

          {/* Priority Distribution Chart */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiGrid style={{ color: 'var(--accent-pink)' }} /> Priority Breakdown
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              {priorities.map((priority) => {
                const count = byPriority[priority] || 0;
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
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

        {/* Row 3: Category Breakdowns */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
            📁 Task Volume by Category
          </h3>
          
          {Object.keys(byCategory).length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
              No categories mapped yet. Create tasks with categories to analyze.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {Object.keys(byCategory).map((category) => {
                const count = byCategory[category];
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={category} className="category-stat-pill" style={{ background: 'rgba(255,255,255,0.01)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{category}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{count} items ({percent}%)</span>
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
    </motion.div>
  );
};

export default AnalyticsPage;
