import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

import TodoListPage from './pages/TodoListPage';
import TodoDetailPage from './pages/TodoDetailPage';

/**
 * App — Global Layout shell configuration.
 * Complies with challenge constraints: exactly two routes (/todos and /todo).
 * Uses query parameters to switch active views inside the main Todos List page.
 */
function App() {
  // Load saved theme on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('taskflow-theme') || 'theme-amethyst';
    document.documentElement.className = savedTheme;
  }, []);

  return (
    <BrowserRouter>
      {/* Background Layer */}
      <div className="app-background" />

      {/* Global Application Layout Frame */}
      <div className="app-layout">
        {/* Global Pinned Header Bar */}
        <Header />

        {/* Global Left Navigation Sidebar */}
        <Sidebar />

        {/* Core Workspace Main Window Pane */}
        <main className="main-content">
          <Routes>
            {/* Redirect root to /todos list page */}
            <Route path="/" element={<Navigate to="/todos" replace />} />

            {/* Main Todos List Page (handles sub-views via ?view= query) */}
            <Route path="/todos" element={<TodoListPage />} />

            {/* Todo Detail Page */}
            <Route path="/todo" element={<TodoDetailPage />} />
          </Routes>
        </main>

        {/* Global Diagnostics Footer */}
        <Footer />
      </div>

      {/* Toast Notifications */}
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
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            fontSize: '0.86rem',
            padding: '10px 16px',
            zIndex: 99999,
          },
          success: {
            iconTheme: {
              primary: '#c084fc',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
