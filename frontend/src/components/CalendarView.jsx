import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';

/**
 * CalendarView — A premium monthly calendar grid for organizing tasks by deadline
 * Features color-coded indicators, month navigation, and daily breakdown list
 */
const CalendarView = ({ todos = [], onSelectTodo }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper: Get days in month
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  // Helper: Get first day index of month (0 = Sun, 6 = Sat)
  const getFirstDayIndex = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayIndex(year, month);

  // Generate grid days
  const gridDays = [];
  // Previous month padding days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    gridDays.push({
      day: daysInPrevMonth - i,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    gridDays.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }

  // Next month padding days to make grid perfect multiple of 7 (6 rows = 42 cells)
  const totalCells = 42;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remainingCells = totalCells - gridDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    gridDays.push({
      day: i,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
    });
  }

  // Navigate months
  const prevMonthNav = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonthNav = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Check if a day has todos
  const getTodosForDay = (y, m, d) => {
    return todos.filter((todo) => {
      if (!todo.dueDate) return false;
      const todoDate = new Date(todo.dueDate);
      return (
        todoDate.getDate() === d &&
        todoDate.getMonth() === m &&
        todoDate.getFullYear() === y
      );
    });
  };

  const selectedDateTodos = getTodosForDay(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  );

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-view-container glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
      {/* Calendar Header */}
      <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          <FiCalendar style={{ color: 'var(--accent-purple)' }} /> Deadlines Calendar
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {monthNames[month]} {year}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={prevMonthNav} className="btn btn-icon" style={{ padding: '6px' }}>
              <FiChevronLeft size={16} />
            </button>
            <button onClick={nextMonthNav} className="btn btn-icon" style={{ padding: '6px' }}>
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          {/* Days labels */}
          <div className="calendar-days-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
            {daysOfWeek.map((day) => (
              <span key={day} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {day}
              </span>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="calendar-cells-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {gridDays.map((cell, idx) => {
              const dayTodos = getTodosForDay(cell.year, cell.month, cell.day);
              const isSelected =
                selectedDate.getDate() === cell.day &&
                selectedDate.getMonth() === cell.month &&
                selectedDate.getFullYear() === cell.year;

              const isToday =
                new Date().getDate() === cell.day &&
                new Date().getMonth() === cell.month &&
                new Date().getFullYear() === cell.year;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(new Date(cell.year, cell.month, cell.day))}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    background: isSelected
                      ? 'var(--glass-active)'
                      : cell.isCurrentMonth
                      ? 'rgba(255,255,255,0.01)'
                      : 'transparent',
                    border: isSelected
                      ? '1px solid var(--accent-purple)'
                      : isToday
                      ? '1px solid rgba(255,255,255,0.2)'
                      : '1px solid transparent',
                    color: cell.isCurrentMonth
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                  }}
                  className="calendar-cell"
                >
                  <span style={{ fontWeight: isToday || isSelected ? 600 : 400 }}>{cell.day}</span>
                  {dayTodos.length > 0 && (
                    <div style={{ display: 'flex', gap: '3px', position: 'absolute', bottom: '4px' }}>
                      {dayTodos.slice(0, 3).map((t, tIdx) => {
                        const colors = {
                          low: 'var(--priority-low)',
                          medium: 'var(--priority-medium)',
                          high: 'var(--priority-high)',
                          urgent: 'var(--priority-urgent)',
                        };
                        return (
                          <span
                            key={tIdx}
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              background: t.completed ? 'var(--text-muted)' : (colors[t.priority] || '#fff'),
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda panel */}
        <div style={{ flex: '1 1 250px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '12px' }}>
            Deadlines on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </h4>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px' }}>
            {selectedDateTodos.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                No deadlines on this date.
              </p>
            ) : (
              selectedDateTodos.map((todo) => (
                <div
                  key={todo.id}
                  onClick={() => onSelectTodo && onSelectTodo(todo)}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: `3px solid var(--priority-${todo.priority})`,
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                >
                  <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                    {todo.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {todo.category}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
