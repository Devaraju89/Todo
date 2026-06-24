import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import TodoListPage from './pages/TodoListPage';
import TodoDetailPage from './pages/TodoDetailPage';

/**
 * App — Root application component
 * Sets up routing, persistent navbar, animated background,
 * and toast notifications with spatial theme
 */
function App() {
  return (
    <BrowserRouter>
      {/* Animated Background Blobs */}
      <div className="app-background">
        <div className="blob-3" />
      </div>

      {/* Persistent Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          {/* Redirect root to /todos */}
          <Route path="/" element={<Navigate to="/todos" replace />} />

          {/* Todo List Page */}
          <Route path="/todos" element={<TodoListPage />} />

          {/* Todo Detail Page */}
          <Route path="/todo" element={<TodoDetailPage />} />
        </Routes>
      </main>

      {/* Toast Notifications — Spatial themed */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(15, 15, 35, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#e2e8f0',
            borderRadius: '12px',
            boxShadow:
              '0 4px 8px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 20, 0.2)',
            fontSize: '0.9rem',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#8b5cf6',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
