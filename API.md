# 📡 TaskFlow — REST API Documentation

Base URL: `http://localhost:5000/api`

All responses follow the format:
```json
{
  "success": true | false,
  "data": { ... } | [ ... ],
  "count": number,        // (optional, on list endpoints)
  "message": "string"     // (on errors)
}
```

---

## Table of Contents

1. [Health Check](#1-health-check)
2. [List All Todos](#2-list-all-todos)
3. [Get Todo Statistics](#3-get-todo-statistics)
4. [Get Single Todo](#4-get-single-todo)
5. [Create Todo](#5-create-todo)
6. [Update Todo](#6-update-todo)
7. [Toggle Completion](#7-toggle-completion)
8. [Delete Todo](#8-delete-todo)
9. [Error Responses](#9-error-responses)
10. [Data Model](#10-data-model)

---

## 1. Health Check

Check if the API server is running.

**Endpoint**: `GET /api/health`

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-06-24T05:24:22.575Z",
    "uptime": 39.17
  }
}
```

---

## 2. List All Todos

Retrieve all todos with optional filtering, searching, and sorting.

**Endpoint**: `GET /api/todos`

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search in title, description, and tags | `?search=documentation` |
| `priority` | string | Filter by priority level | `?priority=high` |
| `category` | string | Filter by category | `?category=work` |
| `completed` | string | Filter by completion status | `?completed=true` |
| `sort` | string | Sort field: `createdAt`, `dueDate`, `priority`, `title` | `?sort=priority` |
| `order` | string | Sort order: `asc` or `desc` (default: `desc`) | `?order=asc` |

**Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Complete project documentation",
      "description": "Write comprehensive docs for the API and features",
      "priority": "high",
      "category": "documentation",
      "dueDate": "2026-06-30T00:00:00.000Z",
      "completed": 0,
      "subtasks": [
        { "id": "sub1", "text": "Draft API.md", "completed": false },
        { "id": "sub2", "text": "Draft FEATURES.md", "completed": true }
      ],
      "tags": ["docs", "api", "final"],
      "createdAt": "2026-06-24T05:00:00.000Z",
      "updatedAt": "2026-06-24T05:00:00.000Z"
    }
  ]
}
```

---

## 3. Get Todo Statistics

Retrieve aggregated statistics about all todos.

**Endpoint**: `GET /api/todos/stats`

---

## 4. Get Single Todo

Retrieve a single todo by its UUID.

**Endpoint**: `GET /api/todos/:id`

---

## 5. Create Todo

Create a new todo item.

**Endpoint**: `POST /api/todos`

**Headers**: `Content-Type: application/json`

**Request Body**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | Task title |
| `description` | string | No | `null` | Task description |
| `priority` | string | No | `"medium"` | `low`, `medium`, `high`, `urgent` |
| `category` | string | No | `"general"` | Task category |
| `dueDate` | string | No | `null` | ISO 8601 date string |
| `subtasks` | array | No | `[]` | Array of `{ id, text, completed }` checklist objects |
| `tags` | array | No | `[]` | Array of custom tag strings |

**Request Example**:
```json
{
  "title": "Review pull requests",
  "description": "Check all pending PRs in the main repository",
  "priority": "high",
  "category": "work",
  "dueDate": "2026-06-25T00:00:00.000Z",
  "subtasks": [
    { "id": "s1", "text": "Run automated checks", "completed": false }
  ],
  "tags": ["github", "review"]
}
```

---

## 6. Update Todo

Update an existing todo. Supports partial updates — only provided fields are modified.

**Endpoint**: `PUT /api/todos/:id`

**Request Body** (all fields optional):

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Updated task title |
| `description` | string | Updated description |
| `priority` | string | `low`, `medium`, `high`, `urgent` |
| `category` | string | Updated category |
| `dueDate` | string | Updated due date (ISO 8601) |
| `completed` | boolean | Updated completion status |
| `subtasks` | array | Updated list of subtasks |
| `tags` | array | Updated list of tags |

---

## 7. Toggle Completion

Toggle a todo's completion status.

**Endpoint**: `PATCH /api/todos/:id/toggle`

---

## 8. Delete Todo

Permanently delete a todo item.

**Endpoint**: `DELETE /api/todos/:id`

---

## 9. Data Model

### Database Schema (SQLite)

```sql
CREATE TABLE IF NOT EXISTS todos (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority    TEXT DEFAULT 'medium',
  category    TEXT DEFAULT 'general',
  dueDate     TEXT,
  completed   INTEGER DEFAULT 0,
  subtasks    TEXT DEFAULT '[]', -- JSON stringified array
  tags        TEXT DEFAULT '[]', -- JSON stringified array
  createdAt   TEXT NOT NULL,
  updatedAt   TEXT NOT NULL
);
```
