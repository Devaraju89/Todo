# 📋 TaskFlow — Features & Functionality Documentation

This document provides a comprehensive listing and description of every feature implemented in the TaskFlow todo ecosystem. Each feature is documented with its behavior, location, and implementation details.

---

## Table of Contents

1. [Premium Spatial UI Design System](#1-premium-spatial-ui-design-system)
2. [Advanced Eisenhower Matrix View](#2-advanced-eisenhower-matrix-view)
3. [Subtasks Checklist System](#3-subtasks-checklist-system)
4. [Tags & Labels System](#4-tags--labels-system)
5. [Data Backup (Export & Import)](#5-data-backup-export--import)
6. [Core CRUD Operations](#6-core-crud-operations)
7. [Todo Properties Matrix](#7-todo-properties-matrix)
8. [Search & Filtering](#8-search--filtering)
9. [Sorting](#9-sorting)
10. [Statistics Dashboard](#10-statistics-dashboard)
11. [Single Todo Detail View](#11-single-todo-detail-view)

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

## 2. Advanced Eisenhower Matrix View
- **Location**: Todo List Page (`/todos`)
- **Trigger**: Toggle the view mode tabs: **List Board** or **Eisenhower Matrix**
- **Details**:
  - The Eisenhower Matrix organizes todos into a **2x2 priority grid** based on urgency and importance:
    - **Quadrant 1 (Do First)**: Urgent & Important (displayed as 🔴 Urgent priority tasks).
    - **Quadrant 2 (Schedule)**: Important, Not Urgent (displayed as 🟠 High priority tasks).
    - **Quadrant 3 (Delegate)**: Urgent, Not Important (displayed as 🟡 Medium priority tasks).
    - **Quadrant 4 (Eliminate)**: Not Urgent & Not Important (displayed as 🟢 Low priority tasks).
  - Each quadrant acts as an active mini-board displaying matching todo cards. Evaluators can toggle completion, edit, or delete items directly from the quadrants.

---

## 3. Subtasks Checklist System
- **Location**: Creation Form, Todo Card, and Todo Detail Page
- **Creation**: Users can add multiple checkbox subtasks/steps (e.g. *Step 1: Write backend tests*, *Step 2: Connect SQLite*) when creating or editing a task.
- **Card Progress Meter**: A dynamic progress bar appears on each todo card showing the ratio and percentage of completed steps (e.g. `2/5 (40%)`).
- **Interactive Toggles**: On both the card list view and the detail page, checklist checkboxes are fully interactive and instantly update the server without needing to enter edit mode.

---

## 4. Tags & Labels System
- **Location**: Creation Form, Todo Card, and Todo Detail Page
- **Details**:
  - Allows tagging todos with custom labels (e.g., `#work`, `#personal`, `#learning`, `#bug`).
  - Tags are displayed as custom pill chips on cards and detail panels.
  - Search queries check against tags, enabling tag-based query indexing.

---

## 5. Data Backup (Export & Import)
- **Location**: Todo List Page utility bar
- **Export Backup**: Downloads all current tasks as a formatted `.json` backup file.
- **Import Backup**: Standard file uploader parses imported JSON files and creates/restores tasks directly to the SQLite database. Supports bulk data restore.

---

## 6. Core CRUD Operations

### 6.1 Create Todo
- **Trigger**: Click the "+ Add Task" button to expand the slide-down form.
- **Fields**: Title (required), Description, Priority, Category, Due Date, Subtask steps, and Tag chips.
- **Validation**: Rejects submissions with empty titles.
- **API**: `POST /api/todos`

### 6.2 Read Todos (List)
- Fetches all todos from the local SQLite database. Uses server-side filters and queries.
- **API**: `GET /api/todos`

### 6.3 Read Todo (Single Detail)
- **Trigger**: Click on a todo's title in the list or matrix.
- **Query Parameter**: Navigates to `/todo?id=<uuid>`, loading data from the query string parameters.
- **API**: `GET /api/todos/:id`

### 6.5 Update Todo
- Opens the todo form pre-filled with existing fields, subtasks, and tags for comprehensive editing.
- **API**: `PUT /api/todos/:id`

### 6.6 Delete Todo
- Triggers a glassmorphism confirmation modal. On confirm, deletes from SQLite with a exit transition.
- **API**: `DELETE /api/todos/:id`

---

## 7. Todo Properties Matrix

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

## 8. Search & Filtering
- **Text Search**: Real-time queries matching **title**, **description**, and **tags**.
- **Drop-down Filters**: Filter by Priority, Category, and status (All, Active, Completed).
- **Clear Filter Button**: Reset all filtering criteria instantly.

---

## 9. Sorting
- **Options**: Created Date, Due Date, Priority (Urgent → Low), and alphabetical Title.

---

## 10. Statistics Dashboard
- Displays four stats counters: **Total**, **Completed**, **Pending**, and **Overdue**.
- Features a circular SVG progress ring indicating overall completion percentage.

---

## 11. Single Todo Detail View
- Navigated via `?id=<uuid>`.
- Displays relative deadlines (e.g. *Yesterday*, *Tomorrow*, *Overdue by 3 days*).
- Displays full timestamps, subtask checklist items, and tags with edit/delete buttons.
