# 📋 TaskFlow — Features Documentation

This document provides a comprehensive listing and description of every feature implemented in the TaskFlow todo application. Each feature is documented with its behavior, location, and implementation details.

---

## Table of Contents

1. [Core CRUD Operations](#1-core-crud-operations)
2. [Todo Properties](#2-todo-properties)
3. [Search & Filtering](#3-search--filtering)
4. [Sorting](#4-sorting)
5. [Statistics Dashboard](#5-statistics-dashboard)
6. [Single Todo Detail View](#6-single-todo-detail-view)
7. [UI/UX Features](#7-uiux-features)
8. [API Features](#8-api-features)
9. [Data Persistence](#9-data-persistence)
10. [Responsive Design](#10-responsive-design)

---

## 1. Core CRUD Operations

### 1.1 Create Todo
- **Location**: Todo List Page (`/todos`)
- **Trigger**: Click the "Add New Task" button to expand the creation form
- **Fields**: Title (required), Description, Priority, Category, Due Date
- **Behavior**: Validates that title is not empty. On success, the new todo appears in the list with a fade-in animation and a success toast notification is shown.
- **API**: `POST /api/todos`

### 1.2 Read Todos (List)
- **Location**: Todo List Page (`/todos`)
- **Behavior**: On page load, all todos are fetched from the API and displayed as spatial cards in a responsive grid (1 column on mobile, 2 on tablet, 3 on desktop). Each card shows the title, truncated description, priority badge, category chip, due date, and completion status.
- **API**: `GET /api/todos`

### 1.3 Read Todo (Single)
- **Location**: Todo Detail Page (`/todo?id=<uuid>`)
- **Trigger**: Click on a todo's title in the list page
- **Behavior**: Navigates to the detail page with the todo's UUID as a query parameter. Displays full todo information including complete description, all timestamps, priority, category, and status. Shows a 404 state if the todo ID is not found.
- **API**: `GET /api/todos/:id`

### 1.4 Update Todo
- **Location**: Both Todo List Page and Todo Detail Page
- **Trigger**: Click the edit (pencil) icon on a todo card or the "Edit" button on the detail page
- **Behavior**: Opens the todo form pre-filled with the existing data. User can modify any field. On save, the todo is updated and the UI reflects changes immediately with a success notification.
- **API**: `PUT /api/todos/:id`

### 1.5 Delete Todo
- **Location**: Both Todo List Page and Todo Detail Page
- **Trigger**: Click the delete (trash) icon on a todo card or the "Delete" button on the detail page
- **Behavior**: Opens a confirmation modal (glassmorphism design) asking "Are you sure?". On confirm, the todo is deleted with a fade-out animation and a success notification. On the detail page, user is redirected back to the list.
- **API**: `DELETE /api/todos/:id`

### 1.6 Toggle Completion
- **Location**: Both Todo List Page and Todo Detail Page
- **Trigger**: Click the checkbox on a todo card or the "Toggle Complete" button on the detail page
- **Behavior**: Toggles the todo's completion status. When completed, the title gets an animated strike-through effect and opacity reduction. A success notification confirms the action.
- **API**: `PATCH /api/todos/:id/toggle`

---

## 2. Todo Properties

Each todo item supports the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| **Title** | Text | ✅ Yes | The main task name (max 200 characters) |
| **Description** | Text | No | Detailed task description |
| **Priority** | Enum | No (default: Medium) | `Low` (green), `Medium` (amber), `High` (orange), `Urgent` (red) |
| **Category** | Enum | No (default: General) | `General`, `Work`, `Personal`, `Health`, `Finance`, `Learning` |
| **Due Date** | Date | No | Task deadline. Overdue items are highlighted with a red indicator |
| **Completed** | Boolean | Auto | Toggled by user interaction |
| **Created At** | Timestamp | Auto | Set on creation, never modified |
| **Updated At** | Timestamp | Auto | Updated on every modification |
| **ID** | UUID v4 | Auto | Unique identifier, auto-generated |

---

## 3. Search & Filtering

### 3.1 Text Search
- **Location**: Filter bar on Todo List Page
- **Behavior**: Real-time search across todo **title** and **description** fields. Results update as the user types. Search is case-insensitive.
- **API Parameter**: `?search=<query>`

### 3.2 Priority Filter
- **Location**: Filter bar dropdown on Todo List Page
- **Options**: All, Low, Medium, High, Urgent
- **Behavior**: Filters the todo list to show only todos matching the selected priority level.
- **API Parameter**: `?priority=<low|medium|high|urgent>`

### 3.3 Category Filter
- **Location**: Filter bar dropdown on Todo List Page
- **Options**: All, General, Work, Personal, Health, Finance, Learning
- **Behavior**: Filters the todo list to show only todos in the selected category.
- **API Parameter**: `?category=<category>`

### 3.4 Status Filter
- **Location**: Filter bar on Todo List Page
- **Options**: All, Active (pending), Completed
- **Behavior**: Filters todos by their completion status.
- **API Parameter**: `?completed=<true|false>`

### 3.5 Clear Filters
- **Location**: Filter bar on Todo List Page
- **Behavior**: Resets all active filters (search, priority, category, status) back to their default "All" state.

---

## 4. Sorting

### 4.1 Sort Options
- **Location**: Filter bar dropdown on Todo List Page
- **Options**:
  - **Created Date** (default) — Sort by creation timestamp
  - **Due Date** — Sort by deadline
  - **Priority** — Sort by priority level (Urgent → High → Medium → Low)
  - **Title** — Sort alphabetically by title
- **Default Order**: Descending (newest first for dates, highest first for priority)
- **API Parameters**: `?sort=<createdAt|dueDate|priority|title>&order=<asc|desc>`

---

## 5. Statistics Dashboard

### 5.1 Stats Panel
- **Location**: Top of Todo List Page
- **Display**: Four animated glassmorphism stat cards showing:
  - **Total Tasks** (blue icon) — Total number of todos
  - **Completed** (green icon) — Number of completed todos
  - **Pending** (amber icon) — Number of incomplete todos
  - **Overdue** (red icon) — Number of past-due incomplete todos
- **Animation**: Numbers animate with a counting effect on page load using Framer Motion
- **Completion Ring**: A circular progress indicator shows the overall completion percentage
- **API**: `GET /api/todos/stats`

---

## 6. Single Todo Detail View

### 6.1 Query Parameter Navigation
- **URL Format**: `/todo?id=<uuid>`
- **Behavior**: The `id` query parameter is read using React Router's `useSearchParams()` hook. The corresponding todo is fetched from the API and displayed.

### 6.2 Detail Card Layout
- **Title**: Displayed as a large heading with the priority color accent
- **Priority Badge**: Color-coded badge (Low/Medium/High/Urgent)
- **Category Chip**: Displays the todo's category
- **Status Badge**: Shows "Completed ✓" (green) or "Pending ○" (amber)
- **Description**: Full text display (no truncation, unlike the list card)
- **Due Date**: Displayed with relative time calculation (e.g., "2 days from now", "Overdue by 3 days")
- **Timestamps**: Shows both "Created at" and "Last updated at" in readable format

### 6.3 Detail Page Actions
- **Back Button**: "← Back to Tasks" link navigating to `/todos`
- **Toggle Complete**: Button to change completion status
- **Edit**: Opens the todo form pre-filled for editing
- **Delete**: Opens confirmation modal, redirects to list on confirm

### 6.4 Error States
- **Not Found**: If the provided `id` doesn't match any todo, a styled 404 message is shown with a link back to the list
- **Loading**: A loading spinner/skeleton is shown while the API request is in progress

---

## 7. UI/UX Features

### 7.1 Spatial UI Design System
- **Theme**: Deep space dark theme (`#0a0a1a` background) with layered surfaces
- **Glassmorphism**: All surfaces use translucent backgrounds with `backdrop-filter: blur()` for depth
- **Shadows**: Multi-layer box-shadows (3-4 layers) creating realistic elevation
- **Gradients**: Aurora-inspired accent gradients (purple → cyan → pink)
- **Typography**: Inter font family from Google Fonts with clear hierarchy

### 7.2 Animated Background
- **Implementation**: CSS keyframe-animated floating gradient blobs
- **Effect**: Subtle aurora-like ambient lighting that moves continuously behind all content
- **Performance**: Pure CSS, no JavaScript overhead

### 7.3 Micro-Animations (Framer Motion)
- **Card Mount**: Todos fade in from below with staggered delays
- **Card Hover**: Cards lift upward (`translateY(-4px)`) with increased shadow
- **Completion Toggle**: Animated checkbox with strike-through effect on title
- **Form Expand/Collapse**: Smooth height and opacity animation
- **Modal**: Scale + fade entrance with backdrop blur
- **Page Transitions**: Smooth transitions between list and detail pages
- **Stats Counter**: Numbers count up from 0 on page load

### 7.4 Toast Notifications
- **Library**: React Hot Toast
- **Usage**: Success/error feedback for all CRUD operations
- **Positioning**: Top-right corner
- **Styling**: Matches the dark spatial theme

### 7.5 Confirmation Dialogs
- **Trigger**: Delete actions (both list and detail page)
- **Design**: Glassmorphism modal with backdrop blur
- **Actions**: "Cancel" (secondary) and "Delete" (danger red) buttons
- **Animation**: AnimatePresence for smooth enter/exit

### 7.6 Empty State
- **Trigger**: When no todos exist or when filters return no results
- **Design**: Illustrated empty state with a message and "Add your first task" call-to-action button

### 7.7 Loading States
- **Trigger**: During API requests
- **Design**: Spinner animation consistent with the spatial theme

### 7.8 Overdue Indicators
- **Trigger**: When a todo has a due date in the past and is not completed
- **Visual**: Red glow effect on the todo card border, "Overdue" badge

### 7.9 Priority Color System
- **Low**: `#22c55e` (Green)
- **Medium**: `#f59e0b` (Amber)
- **High**: `#f97316` (Orange)
- **Urgent**: `#ef4444` (Red)
- **Usage**: Left border accent on cards, priority badges, detail page accents

### 7.10 Navigation
- **Navbar**: Fixed glassmorphism top bar with app name "TaskFlow" (gradient text) and navigation links
- **Active State**: Current page link is highlighted in the navbar
- **Multi-Page**: Distinct URL routes (`/todos`, `/todo?id=`) with React Router

---

## 8. API Features

### 8.1 RESTful Design
- All endpoints follow REST conventions
- Consistent JSON response format: `{ success: boolean, data: any, count?: number }`
- Proper HTTP status codes (200, 201, 400, 404, 500)

### 8.2 Server-Side Filtering
- All filtering (priority, category, status, search) is performed on the server
- Reduces data transfer and improves performance

### 8.3 Server-Side Sorting
- Priority sorting uses semantic ordering (urgent > high > medium > low) via SQL CASE expressions
- Supports ascending and descending order

### 8.4 Input Validation
- Title is required for creation
- Invalid todo IDs return 404
- Malformed requests return 400 with descriptive error messages

### 8.5 Health Check Endpoint
- `GET /api/health` returns server status, uptime, and timestamp
- Useful for monitoring and deployment verification

### 8.6 Error Handling
- Centralized error middleware catches all unhandled errors
- Stack traces only exposed in development mode
- Consistent error response format

---

## 9. Data Persistence

### 9.1 SQLite Database
- **Engine**: better-sqlite3 (synchronous, high-performance SQLite binding)
- **File**: `backend/todos.db` (auto-created on first run)
- **Mode**: WAL (Write-Ahead Logging) for better concurrent read performance
- **Schema**: Single `todos` table with UUID primary keys

### 9.2 Sample Data Seeding
- On first run, if the database is empty, 5 sample todos are automatically seeded
- Samples cover different priorities, categories, and completion states
- Provides an immediate demo experience

---

## 10. Responsive Design

### 10.1 Breakpoints
- **Mobile**: < 640px — Single column layout, stacked filters
- **Tablet**: 640px – 1024px — Two column card grid
- **Desktop**: > 1024px — Three column card grid, full filter bar

### 10.2 Adaptive Components
- Navbar collapses gracefully on mobile
- Todo cards stack vertically on small screens
- Filter bar wraps to multiple lines on narrow viewports
- Detail page adjusts padding and font sizes

---

## Summary

TaskFlow implements **14 major features** across **4 categories** (CRUD, Filtering/Sorting, Statistics, UI/UX), with full REST API backend, SQLite persistence, and a premium Spatial UI design that creates a visually stunning, production-grade todo management experience.
