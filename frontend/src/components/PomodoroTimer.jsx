import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiRotateCcw, FiAward, FiClock } from 'react-icons/fi';

/**
 * PomodoroTimer — A premium spatial focused timer integrated with todo tasks
 * Features visual progress ring, modes (Focus, Break), and start/pause/reset controls.
 */
const PomodoroTimer = ({ todos = [], onCompleteFocus }) => {
  const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState('');
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef(null);

  const modeTimes = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    setTimeLeft(modeTimes[mode]);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setCompletedSessions((prev) => prev + 1);
      if (selectedTodoId && onCompleteFocus) {
        onCompleteFocus(selectedTodoId);
      }
      alert('Focus session complete! Take a break.');
      setMode('shortBreak');
    } else {
      alert('Break complete! Time to focus.');
      setMode('focus');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modeTimes[mode]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = (timeLeft / modeTimes[mode]) * 100;
  const strokeDashoffset = 283 - (283 * (100 - percentage)) / 100;

  return (
    <div className="pomodoro-container glass-card" style={{ marginBottom: '24px', padding: '20px' }}>
      <div className="pomodoro-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          <FiClock style={{ color: 'var(--accent-purple)' }} /> Focus Space (Pomodoro)
        </h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          {Object.keys(modeTimes).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`view-tab-btn ${mode === m ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </button>
          ))}
        </div>
      </div>

      <div className="pomodoro-body" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        {/* Timer Visualization Ring */}
        <div className="timer-ring-container" style={{ position: 'relative', width: '120px', height: '120px' }}>
          <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="var(--accent-purple)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="timer-text" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
              {formatTime(timeLeft)}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {isRunning ? 'active' : 'paused'}
            </span>
          </div>
        </div>

        {/* Timer Integration & Controls */}
        <div className="timer-details" style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Focus Target</label>
            <select
              value={selectedTodoId}
              onChange={(e) => setSelectedTodoId(e.target.value)}
              className="form-select"
              style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
            >
              <option value="">-- Select task to focus on --</option>
              {todos.filter((t) => !t.completed).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.button
              onClick={toggleTimer}
              className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`}
              style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isRunning ? (
                <>
                  <FiPause size={14} /> Pause
                </>
              ) : (
                <>
                  <FiPlay size={14} /> Focus Now
                </>
              )}
            </motion.button>

            <motion.button
              onClick={resetTimer}
              className="btn btn-secondary"
              style={{ padding: '8px', borderRadius: '8px' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Reset Timer"
            >
              <FiRotateCcw size={14} />
            </motion.button>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <FiAward style={{ color: 'var(--accent-pink)' }} />
              <span>Sessions: <strong>{completedSessions}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
