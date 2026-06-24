# 📋 TaskFlow — Features & Functionality Documentation

This document provides a comprehensive listing and description of every feature implemented in the TaskFlow todo ecosystem. Each feature is documented with its behavior, location, and implementation details.

---

## Table of Contents

1. [Desktop-Grade Application Shell Grid](#1-desktop-grade-application-shell-grid)
2. [Visual Themes Customizer](#2-visual-themes-customizer)
3. [Core Tasks Backlog View](#3-core-tasks-backlog-view)
4. [SaaS Kanban Board Page](#4-saas-kanban-board-page)
5. [Eisenhower Priority Matrix Page](#5-eisenhower-priority-matrix-page)
6. [Deadlines Calendar Page](#6-deadlines-calendar-page)
7. [Pomodoro Focus Zone Page](#7-pomodoro-focus-zone-page)
8. [Productivity Insights & Analytics Page](#8-productivity-insights--analytics-page)
9. [Subtasks Checklist System](#9-subtasks-checklist-system)
10. [Tags & Labels System](#10-tags--labels-system)
11. [Data Backup (Export & Import)](#11-data-backup-export--import)
12. [Core CRUD Operations](#12-core-crud-operations)
13. [Todo Properties Matrix](#13-todo-properties-matrix)
14. [Search, Filtering & Sorting](#14-search-filtering--sorting)
15. [Single Todo Detail View](#15-single-todo-detail-view)

---

## 1. Desktop-Grade Application Shell Grid

TaskFlow implements a full-viewport app layout spanning `100vw` and `100vh` without page double scrollbars, utilizing a rigid CSS Grid. The shell consists of three persistent layout nodes:
- **Global Header**: Fixed at the top (`height: 70px`). Displays the branding logo, "TaskFlow PRO" title, live stats metrics (Total, Completed, Pending, Overdue) that query automatically on navigation, current date widget, and user profile avatar.
- **Global Left Sidebar**: Docked on the left (`width: 240px`). Holds navigation links with text labels and custom icons, collapsing to `70px` on mobile. Uses spring-based Framer Motion overlays to slide indicator dots on active pages.
- **Global Footer**: Pinned at the bottom (`height: 36px`). Houses database diagnostics ("SQLite Active"), current backend environment readout, and a real-time progress bar computing task completion percentages.

---

## 2. Visual Themes Customizer
- **Location**: Settings page (`/settings`)
- **Details**:
  - Allows the user to switch the app's visual identity globally. Accent lighting styles rebind instantly and persist across restarts via `localStorage`:
    - **Amethyst Deep** (Default): Warm purple-pink neon glow accents.
    - **Sunset Gold**: Amber gold, orange, and rose accents.
    - **Forest Emerald**: Lush mint and emerald green organic accents.
    - **Obsidian Dark**: Classic steel-grey and high-contrast off-white accents.

---

## 3. Core Tasks Backlog View
- **Location**: `/todos`
- **Details**:
  - Displays the primary checklists backlog grid. Contains real-time text search and filter drop-downs.
  - Clicking "+ New Task" slides down the validation form. Cards display custom category indicators and checklists with active triggers.

---

## 4. SaaS Kanban Board Page
- **Location**: `/kanban`
- **Details**:
  - Distributes tasks into three status-driven pipelines:
    - **To Do**: Tasks with no checklist progress.
    - **In Progress**: Tasks with active checklist step progress.
    - **Completed**: Checked-off tasks.
  - Features independent column scrollbars and quick-action state triggers (Start, Reopen, Move Back) to update task progress.

---

## 5. Eisenhower Priority Matrix Page
- **Location**: `/matrix`
- **Details**:
  - Sorts backlog items dynamically into a 2x2 grid representing the quadrants of productivity:
    - **Do First**: Urgent & Important tasks (🔴 Urgent priority).
    - **Schedule**: Important, Not Urgent tasks (🟠 High priority).
    - **Delegate**: Urgent, Not Important tasks (🟡 Medium priority).
    - **Eliminate**: Not Urgent & Not Important tasks (🟢 Low priority).

---

## 6. Deadlines Calendar Page
- **Location**: `/calendar`
- **Details**:
  - Generates a month grid plotting date deadlines. Days with due tasks are marked with priority indicators. Clicking a day loads an agenda sidebar, and clicking a task launches edit dialogs.

---

## 7. Pomodoro Focus Zone Page
- **Location**: `/focus`
- **Details**:
  - Includes a visual progress circle timer. Integrates with a task selector allowing users to lock onto a pending todo. When the 25-minute timer finishes, it completes the task in SQLite.

---

## 8. Productivity Insights & Analytics Page
- **Location**: `/analytics`
- **Details**:
  - Productivity dashboard compiling database statistics:
    - **Productivity Score**: Completed vs total ratio displayed inside an animated SVG circular ring chart.
    - **Priority distribution**: Graphical horizontal bar charts indicating task counts grouped by priority.
    - **Category distribution**: Segmented visual metrics showing backlog volume across categories.

---

## 9. Subtasks Checklist System
- **Location**: Todo Form, Todo Card, and Todo Detail Page
- **Details**:
  - Supports adding step-by-step checklists to tasks. Todo cards render progress bars (e.g. `2/5 completed`) representing subtask ratios. Checklist toggles are active and sync to SQLite instantly.

---

## 10. Tags & Labels System
- **Location**: Todo Form, Todo Card, and Todo Detail Page
- **Details**:
  - Allows tagging tasks with custom label chips (e.g., `#work`, `#finance`). Search indexes query tags, enabling instant tag sorting.

---

## 11. Data Backup (Export & Import)
- **Location**: Settings page (`/settings`)
- **Details**:
  - **Export JSON**: Downloads all SQLite task records as a formatted `.json` backup file.
  - **Import JSON**: Uploads a backup file and executes bulk insertion into the SQLite database.

---

## 12. Core CRUD Operations

### 12.1 Create Todo
- **API**: `POST /api/todos`
- Validates that task title is provided. Accepts descriptions, priority badges, categories, deadlines, checklists, and tag arrays.

### 12.2 Read Todos (List)
- **API**: `GET /api/todos`
- Retrieves todos from SQLite. Supports sorting and filters.

### 12.3 Read Todo (Single Detail)
- **API**: `GET /api/todos/:id`
- Navigates to `/todo?id=<uuid>` to show detailed fields, timestamps, checklists, and tags.

### 12.4 Update Todo
- **API**: `PUT /api/todos/:id`
- Partially or fully updates a todo task's fields.

### 12.5 Delete Todo
- **API**: `DELETE /api/todos/:id`
- Removes a task from the database. Triggers glassmorphic confirmation modal prior to execution.

---

## 13. Todo Properties Matrix

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

## 14. Search, Filtering & Sorting
- **Search**: Matches title, description, and tags in real-time.
- **Filtering**: Filters by priority, category, and status.
- **Sorting**: Sorts by Created Date, Due Date, Priority (Urgent → Low), and alphabetical title.

---

## 15. Single Todo Detail View
- Displays full properties (timestamps, descriptions, subtask checklists, and tag chips) with toggles and edit/delete overlays.
