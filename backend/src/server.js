// ============================================================================
// Server Entry Point — Express.js Application Bootstrap
// ============================================================================
// Configures middleware, mounts routes, and starts the HTTP server.
// ============================================================================

// Load environment variables before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const todoRoutes = require('./routes/todoRoutes');
const errorHandler = require('./middleware/errorHandler');

// ── Initialize Express ──────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ───────────────────────────────────────────────────────

// Enable CORS for all origins in development
app.use(cors());

// Parse JSON request bodies (up to 10 MB)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/todos', todoRoutes);

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// ── 404 Handler — catch unmatched routes ────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ── Error Handler (must be last) ────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Todo API server running on http://localhost:${PORT}`);
  console.log(`📝 API base URL: http://localhost:${PORT}/api/todos`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment:  ${process.env.NODE_ENV || 'production'}\n`);
});

module.exports = app;
