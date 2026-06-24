# 📋 TaskFlow — Spatial Todo Manager

A full-stack, production-grade todo application built with **React + Vite** (frontend) and **Express.js + SQLite** (backend), featuring a stunning **Spatial UI Design** with glassmorphism, 3D depth effects, and micro-animations.

![TaskFlow](https://img.shields.io/badge/TaskFlow-Spatial%20Todo%20Manager-8b5cf6?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│                                                          │
│  ┌──────────────────┐    ┌───────────────────────────┐  │
│  │  /todos           │    │  /todo?id=<uuid>          │  │
│  │  Todo List Page   │    │  Todo Detail Page          │  │
│  │  • Stats Panel    │    │  • Full todo details       │  │
│  │  • Filter Bar     │    │  • Edit / Delete / Toggle  │  │
│  │  • Todo Cards     │    │  • Activity timeline       │  │
│  │  • Add/Edit Form  │    │  • Back navigation         │  │
│  └────────┬─────────┘    └────────────┬──────────────┘  │
│           │        Axios HTTP         │                   │
│           └────────────┬──────────────┘                   │
└────────────────────────┼─────────────────────────────────┘
                         │ REST API
┌────────────────────────┼─────────────────────────────────┐
│                 SERVER (Express.js)                        │
│                        │                                  │
│  ┌─────────────────────▼─────────────────────────────┐   │
│  │              API Routes (/api/todos)               │   │
│  │  GET / | GET /:id | POST / | PUT /:id             │   │
│  │  PATCH /:id/toggle | DELETE /:id | GET /stats     │   │
│  └─────────────────────┬─────────────────────────────┘   │
│                        │                                  │
│  ┌─────────────────────▼─────────────────────────────┐   │
│  │            Controllers → Models → SQLite           │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
todo-app/
├── frontend/                   # React + Vite frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx          # Glassmorphism navigation bar
│   │   │   ├── TodoCard.jsx        # Spatial todo card with animations
│   │   │   ├── TodoForm.jsx        # Create/edit form with validation
│   │   │   ├── FilterBar.jsx       # Search, filter & sort controls
│   │   │   ├── StatsPanel.jsx      # Animated statistics dashboard
│   │   │   └── ConfirmModal.jsx    # Confirmation dialog
│   │   ├── pages/              # Application pages
│   │   │   ├── TodoListPage.jsx    # Main todos list (/todos)
│   │   │   └── TodoDetailPage.jsx  # Single todo detail (/todo?id=)
│   │   ├── services/           # API communication layer
│   │   │   └── api.js              # Axios HTTP client
│   │   ├── styles/             # Design system
│   │   │   └── index.css           # Spatial UI design tokens & styles
│   │   ├── App.jsx             # Root component with routing
│   │   └── main.jsx            # Application entry point
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration (API proxy)
│   └── package.json
│
├── backend/                    # Express.js + SQLite backend
│   ├── src/
│   │   ├── server.js               # Express app bootstrap
│   │   ├── database/
│   │   │   └── db.js               # SQLite connection & schema
│   │   ├── models/
│   │   │   └── todoModel.js        # Data access layer
│   │   ├── controllers/
│   │   │   └── todoController.js   # Request handlers
│   │   ├── routes/
│   │   │   └── todoRoutes.js       # REST route definitions
│   │   └── middleware/
│   │       └── errorHandler.js     # Centralized error handling
│   ├── .env                    # Environment variables
│   └── package.json
│
├── README.md                   # This file
├── FEATURES.md                 # Detailed feature documentation
├── API.md                      # REST API documentation
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)

### 📦 Option A: Quick Concurrent Setup (Recommended)

Run everything from the root folder in just two commands:

1. **Install all dependencies** (installs root, backend, and frontend dependencies):
   ```bash
   npm run install-all
   ```

2. **Start both backend and frontend concurrently**:
   ```bash
   npm run dev
   ```

This will concurrently run the Express backend on `http://localhost:5000` and the React frontend on `http://localhost:5173`. On first run, the SQLite database is auto-created and seeded.

---

### 🔧 Option B: Manual Folder-by-Folder Setup

1. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The API server starts at `http://localhost:5000`.

2. **Start the Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   The React app starts at `http://localhost:5173`.

---

### 4. Open in Browser

Navigate to **http://localhost:5173/todos** to see the application.


---

## 🎨 Design Philosophy — Spatial UI

TaskFlow implements a **Spatial UI Design** language inspired by Apple Vision Pro and modern glassmorphism trends:

| Principle | Implementation |
|-----------|---------------|
| **Depth & Layering** | Multi-layer translucent surfaces with `backdrop-filter: blur()` |
| **Elevation System** | 3-4 layered box-shadows that intensify on hover |
| **Ambient Lighting** | Animated floating gradient blobs in the background |
| **Motion Design** | Spring-based Framer Motion animations on mount, hover, state changes |
| **Typography** | Inter font family with clear weight + size hierarchy |
| **Color Palette** | Deep space dark (#0a0a1a) + aurora accents (purple → cyan → pink) |
| **Interactivity** | Cards lift on hover, buttons scale, checkboxes animate |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI component library |
| **Build Tool** | Vite | Fast development & build |
| **Routing** | React Router DOM | Multi-page navigation |
| **Animations** | Framer Motion | Spatial micro-animations |
| **HTTP Client** | Axios | API communication |
| **Icons** | React Icons (Feather) | UI iconography |
| **Notifications** | React Hot Toast | User feedback toasts |
| **Backend** | Express.js | REST API framework |
| **Database** | SQLite (better-sqlite3) | File-based persistence |
| **IDs** | UUID v4 | Unique todo identifiers |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | Project overview, setup, architecture (this file) |
| [FEATURES.md](FEATURES.md) | Detailed feature documentation with descriptions |
| [API.md](API.md) | Complete REST API reference with examples |

---

## 🔗 Quick Links

- **Frontend Dev Server**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/todos
- **Health Check**: http://localhost:5000/api/health
- **Todo List Page**: http://localhost:5173/todos
- **Single Todo Page**: http://localhost:5173/todo?id=`<todo-uuid>`

---

## 📝 License

This project is created as an academic assignment submission.
