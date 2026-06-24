# 📋 TaskFlow — Features & Functionality Documentation

This document provides a comprehensive listing and description of every feature implemented in the TaskFlow todo ecosystem. Each feature is documented with its behavior, location, and implementation details.

---

## Table of Contents

1. [Premium Spatial UI Design System](#1-premium-spatial-ui-design-system)
2. [SaaS Kanban Board View](#2-saas-kanban-board-view)
3. [Deadlines Calendar View](#3-deadlines-calendar-view)
4. [Pomodoro Focus Timer Integration](#4-pomodoro-focus-timer-integration)
5. [Advanced Eisenhower Matrix View](#5-advanced-eisenhower-matrix-view)
6. [Subtasks Checklist System](#6-subtasks-checklist-system)
7. [Tags & Labels System](#7-tags--labels-system)
8. [Data Backup (Export & Import)](#8-data-backup-export--import)
9. [Core CRUD Operations](#9-core-crud-operations)
10. [Todo Properties Matrix](#10-todo-properties-matrix)
11. [Search & Filtering](#11-search--filtering)
12. [Sorting](#12-sorting)
13. [Statistics Dashboard](#13-statistics-dashboard)
14. [Single Todo Detail View](#14-single-todo-detail-view)

---

## 1. Premium Spatial UI Design System

TaskFlow implements a **Spatial UI Design** language inspired by Apple Vision Pro, redesigned with a **Warm Amethyst-Rose-Gold** color scheme (no blue tones used):

| Element | Visual Style |
|-----------|---------------|
| **Theme Base** | Deep dark Obsidian Amethyst background (`#0a0510`) with layered surfaces. |
| **Glassmorphism** | Translucent cards with `backdrop-filter: blur(24px)` and borders made of `rgba(255,255,255,0.07)`. |
| **Ambient Blobs** | Dynamic background gradient blobs (radial purple `#c084fc` to gold `#fbbf24`) float organic pathways using CSS animations. |
| **Hover Transitions** | Todo cards respond to hover by shifting upward (`translateY(-4px)`) and multiplying their soft layered shadows. |
| **Typography** | Styled with the geometric sans-serif **Inter** font family. |

---

## 2. SaaS Kanban Board View
- **Location**: Todo List Page (`/todos`)
- **Trigger**: Toggle the view mode tabs to **Kanban Board**
- **Details**:
  - The Kanban Board distributes todos into three status-driven columns:
    - **To Do**: Tasks that have not been started or have no checklist progress.
    - **In Progress**: Tasks that are actively being worked on (i.e. have checklist subtasks that are partially completed).
    - **Completed**: Tasks that are finished (`completed === 1`).
  - Evaluators can easily transition tasks between columns using quick-action buttons (e.g. *Start Work*, *Move Back*, *Complete*). Column task counters are updated dynamically.

---

## 3. Deadlines Calendar View
- **Location**: Todo List Page (`/todos`)
- **Trigger**: Toggle the view mode tabs to **Deadlines Calendar**
- **Details**:
  - Renders a monthly calendar grid calculating padding days from previous/next months.
  - Days with deadlines are annotated with priority-colored indicator dots mapping to the pending tasks.
  - Clicking any date displays an agenda list on the right showing tasks due on that day. Clicking an agenda task launches its Edit interface immediately.

---

## 4. Pomodoro Focus Timer Integration
- **Location**: Todo List Page (`/todos`), placed prominently at the top
- **Details**:
  - A premium floating panel featuring a countdown timer.
  - **Modes**: Support for `Focus` (25 min), `Short Break` (5 min), and `Long Break` (15 min) sessions.
  - **Integrated Task Selection**: Allows users to select any pending task from a dropdown menu. If a focus session finishes while working on a task, it triggers a focus completion callback to mark the task completed.
  - Tracks session count dynamically in the session dashboard.

---

## 5. Advanced Eisenhower Matrix View
- **Location**: Todo List Page (`/todos`)
- **Trigger**: Toggle the view mode tabs to **Eisenhower Matrix**
- **Details**:
  - The Eisenhower Matrix organizes todos into a **2x2 priority grid** based on urgency and importance:
    - **Quadrant 1 (Do First)**: Urgent & Important (displayed as 🔴 Urgent priority tasks).
    - **Quadrant 2 (Schedule)**: Important, Not Urgent (displayed as 🟠 High priority tasks).
    - **Quadrant 3 (Delegate)**: Urgent, Not Important (displayed as 🟡 Medium priority tasks).
    - **Quadrant 4 (Eliminate)**: Not Urgent & Not Important (displayed as 🟢 Low priority tasks).
  - Each quadrant acts as an active mini-board displaying matching todo cards. Evaluators can toggle completion, edit, or delete items directly from the quadrants.

---

## 6. Subtasks Checklist System
- **Location**: Creation Form, Todo Card, and Todo Detail Page
- **Creation**: Users can add multiple checkbox subtasks/steps (e.g. *Step 1: Write backend tests*, *Step 2: Connect SQLite*) when creating or editing a task.
- **Card Progress Meter**: A dynamic progress bar appears on each todo card showing the ratio and percentage of completed steps (e.g. `2/5 (40%)`).
- **Interactive Toggles**: On both the card list view and the detail page, checklist checkboxes are fully interactive and instantly update the server without needing to enter edit mode.

---

## 7. Tags & Labels System
- **Location**: Creation Form, Todo Card, and Todo Detail Page
- **Details**:
  - Allows tagging todos with custom labels (e.g., `#work`, `#personal`, `#learning`, `#bug`).
  - Tags are displayed as custom pill chips on cards and detail panels.
  - Search queries check against tags, enabling tag-based query indexing.

---

## 8. Data Backup (Export & Import)
- **Location**: Todo List Page utility bar
- **Export Backup**: Downloads all current tasks as a formatted `.json` backup file.
- **Import Backup**: Standard file uploader parses imported JSON files and creates/restores tasks directly to the SQLite database. Supports bulk data restore.

---

## 9. Core CRUD Operations

### 9.1 Create Todo
- **Trigger**: Click the "+ Add Task" button to expand the slide-down form.
- **Fields**: Title (required), Description, Priority, Category, Due Date, Subtask steps, and Tag chips.
- **Validation**: Rejects submissions with empty titles.
- **API**: `POST /api/todos`

### 9.2 Read Todos (List)
- Fetches all todos from the local SQLite database. Uses server-side filters and queries.
- **API**: `GET /api/todos`

### 9.3 Read Todo (Single Detail)
- **Trigger**: Click on a todo's title in the list or matrix.
- **Query Parameter**: Navigates to `/todo?id=<uuid>`, loading data from the query string parameters.
- **API**: `GET /api/todos/:id`

### 9.4 Update Todo
- Opens the todo form pre-filled with existing fields, subtasks, and tags for comprehensive editing.
- **API**: `PUT /api/todos/:id`

### 9.5 Delete Todo
- Triggers a glassmorphism confirmation modal. On confirm, deletes from SQLite with a exit transition.
- **API**: `DELETE /api/todos/:id`

---

## 10. Todo Properties Matrix

Each todo item supports the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Title** | Text | Yes | Name of the task |
| **Description** | Text | No | Deep-dive details |
| **Priority** | Enum | No | `low` (green), `medium` (yellow), `high` (orange), `urgent` (red) |
| **Category** | Enum | No | `General`, `Work`, `Personal`, `Health`, `Finance`, `Learning` |
| **Due Date** | Date | No | Deadline. Overdue tasks trigger a red neon glow border |
| **Completed** | Boolean | Auto | Overall checklist status |
| **Subtasks** | Array | Auto | List of checklist steps `[{ id, text, completed }]` |
| **Tags** | Array | Auto | Array of custom tags `[ "work", "bug" ]` |
| **Timestamps** | ISO Strings | Auto | `createdAt` and `updatedAt` |

---

## 11. Search & Filtering
- **Text Search**: Real-time queries matching **title**, **description**, and **tags**.
- **Drop-down Filters**: Filter by Priority, Category, and status (All, Active, Completed).
- **Clear Filter Button**: Reset all filtering criteria instantly.

---

## 12. Sorting
- **Options**: Created Date, Due Date, Priority (Urgent → Low), and alphabetical Title.

---

## 13. Statistics Dashboard
- Displays four stats counters: **Total**, **Completed**, **Pending**, and **Overdue**.
- Features a circular SVG progress ring indicating overall completion percentage.

---

## 14. Single Todo Detail View
- Navigated via `?id=<uuid>`.
- Displays relative deadlines (e.g. *Yesterday*, *Tomorrow*, *Overdue by 3 days*).
- Displays full timestamps, subtask checklist items, and tags with edit/delete buttons.
