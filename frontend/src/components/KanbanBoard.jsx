import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiPlay, FiBookOpen } from 'react-icons/fi';
import TodoCard from './TodoCard';

/**
 * KanbanBoard — A premium task board sorting tasks into status columns
 * Features click-to-move quick actions, status indicators, and column counts
 */
const KanbanBoard = ({ todos = [], onToggle, onDelete, onEdit, onUpdate }) => {
  // Sort tasks into status categories
  const getTasksByStatus = () => {
    const todoList = [];
    const inProgressList = [];
    const doneList = [];

    todos.forEach((t) => {
      const totalSubs = t.subtasks?.length || 0;
      const doneSubs = t.subtasks?.filter((s) => s.completed).length || 0;

      if (t.completed === 1) {
        doneList.push(t);
      } else if (totalSubs > 0 && doneSubs > 0 && doneSubs < totalSubs) {
        inProgressList.push(t);
      } else {
        todoList.push(t);
      }
    });

    return { todoList, inProgressList, doneList };
  };

  const { todoList, inProgressList, doneList } = getTasksByStatus();

  const handleMoveToToDo = (t) => {
    if (!onUpdate) return;
    const resetSubs = t.subtasks?.map((s) => ({ ...s, completed: false })) || [];
    onUpdate(t.id, { completed: 0, subtasks: resetSubs });
  };

  const handleMoveToInProgress = (t) => {
    if (!onUpdate) return;
    // Ensure at least one subtask is checked to stay in progress, or create a mock subtask step
    let updatedSubs = [...(t.subtasks || [])];
    if (updatedSubs.length === 0) {
      updatedSubs = [
        { id: Math.random().toString(), text: 'Initial work', completed: true },
        { id: Math.random().toString(), text: 'Review changes', completed: false }
      ];
    } else {
      // Mark the first subtask as completed to trigger in-progress status
      updatedSubs[0] = { ...updatedSubs[0], completed: true };
    }
    onUpdate(t.id, { completed: 0, subtasks: updatedSubs });
  };

  const handleMoveToDone = (t) => {
    if (onToggle) {
      onToggle(t.id);
    }
  };

  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      subtitle: 'Tasks to be started',
      icon: <FiBookOpen size={16} style={{ color: 'var(--accent-purple)' }} />,
      tasks: todoList,
      actions: (t) => (
        <div style={{ display: 'flex', gap: '4px', marginTop: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => handleMoveToInProgress(t)}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Start Work"
          >
            Start <FiChevronRight size={12} />
          </button>
        </div>
      ),
    },
    {
      id: 'progress',
      title: 'In Progress',
      subtitle: 'Currently working on',
      icon: <FiPlay size={16} style={{ color: 'var(--accent-cyan)' }} />,
      tasks: inProgressList,
      actions: (t) => (
        <div style={{ display: 'flex', gap: '4px', marginTop: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => handleMoveToToDo(t)}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            <FiChevronLeft size={12} /> Move Back
          </button>
          <button
            onClick={() => handleMoveToDone(t)}
            className="btn btn-primary"
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Complete <FiChevronRight size={12} />
          </button>
        </div>
      ),
    },
    {
      id: 'done',
      title: 'Completed',
      subtitle: 'Finished tasks',
      icon: <FiCheckCircle size={16} style={{ color: 'var(--priority-low)' }} />,
      tasks: doneList,
      actions: (t) => (
        <div style={{ display: 'flex', gap: '4px', marginTop: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => handleMoveToToDo(t)}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            <FiChevronLeft size={12} /> Reopen
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="kanban-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '8px' }}>
      {columns.map((col) => (
        <div
          key={col.id}
          className="kanban-column glass-card"
          style={{
            padding: '16px',
            minHeight: '450px',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.01)',
          }}
        >
          <div
            className="kanban-column-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--glass-border)',
              paddingBottom: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {col.icon} {col.title}
              </h4>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>{col.subtitle}</p>
            </div>
            <span
              className="badge"
              style={{
                background: 'var(--glass-active)',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                padding: '4px 8px',
                borderRadius: '8px',
              }}
            >
              {col.tasks.length}
            </span>
          </div>

          <div
            className="kanban-column-content"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflowY: 'auto',
              maxHeight: '500px',
              paddingRight: '2px',
            }}
          >
            {col.tasks.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                No tasks in this column.
              </p>
            ) : (
              <AnimatePresence mode="popLayout">
                {col.tasks.map((todo) => (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TodoCard
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onUpdate={onUpdate}
                    />
                    {col.actions(todo)}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
