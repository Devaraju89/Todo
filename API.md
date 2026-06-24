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

**cURL**:
```bash
curl http://localhost:5000/api/health
```

---

## 2. List All Todos

Retrieve all todos with optional filtering, searching, and sorting.

**Endpoint**: `GET /api/todos`

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search in title and description (case-insensitive) | `?search=project` |
| `priority` | string | Filter by priority level | `?priority=high` |
| `category` | string | Filter by category | `?category=work` |
| `completed` | string | Filter by completion status | `?completed=true` |
| `sort` | string | Sort field: `createdAt`, `dueDate`, `priority`, `title` | `?sort=priority` |
| `order` | string | Sort order: `asc` or `desc` (default: `desc`) | `?order=asc` |

**Response** (`200 OK`):
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Complete project documentation",
      "description": "Write comprehensive docs for the API and features",
      "priority": "high",
      "category": "documentation",
      "dueDate": "2026-06-30T00:00:00.000Z",
      "completed": 0,
      "createdAt": "2026-06-24T05:00:00.000Z",
      "updatedAt": "2026-06-24T05:00:00.000Z"
    }
  ]
}
```

**cURL Examples**:
```bash
# Get all todos
curl http://localhost:5000/api/todos

# Search todos
curl "http://localhost:5000/api/todos?search=project"

# Filter by priority
curl "http://localhost:5000/api/todos?priority=high"

# Filter by category and sort by due date
curl "http://localhost:5000/api/todos?category=work&sort=dueDate&order=asc"

# Get only completed todos
curl "http://localhost:5000/api/todos?completed=true"

# Combine filters
curl "http://localhost:5000/api/todos?priority=urgent&category=work&sort=dueDate&order=asc"
```

---

## 3. Get Todo Statistics

Retrieve aggregated statistics about all todos.

**Endpoint**: `GET /api/todos/stats`

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "total": 5,
    "completed": 1,
    "pending": 4,
    "overdue": 1,
    "byPriority": {
      "low": 1,
      "medium": 1,
      "high": 2,
      "urgent": 1
    },
    "byCategory": {
      "development": 2,
      "documentation": 1,
      "personal": 1,
      "work": 1
    }
  }
}
```

**cURL**:
```bash
curl http://localhost:5000/api/todos/stats
```

---

## 4. Get Single Todo

Retrieve a single todo by its UUID.

**Endpoint**: `GET /api/todos/:id`

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The unique identifier of the todo |

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Complete project documentation",
    "description": "Write comprehensive docs for the API and features",
    "priority": "high",
    "category": "documentation",
    "dueDate": "2026-06-30T00:00:00.000Z",
    "completed": 0,
    "createdAt": "2026-06-24T05:00:00.000Z",
    "updatedAt": "2026-06-24T05:00:00.000Z"
  }
}
```

**Error Response** (`404 Not Found`):
```json
{
  "success": false,
  "message": "Todo not found"
}
```

**cURL**:
```bash
curl http://localhost:5000/api/todos/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## 5. Create Todo

Create a new todo item.

**Endpoint**: `POST /api/todos`

**Headers**: `Content-Type: application/json`

**Request Body**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | ✅ Yes | — | Task title (max 200 chars) |
| `description` | string | No | `""` | Task description |
| `priority` | string | No | `"medium"` | `low`, `medium`, `high`, `urgent` |
| `category` | string | No | `"general"` | Task category |
| `dueDate` | string | No | `null` | ISO 8601 date string |

**Request Example**:
```json
{
  "title": "Review pull requests",
  "description": "Check all pending PRs in the main repository",
  "priority": "high",
  "category": "work",
  "dueDate": "2026-06-25T00:00:00.000Z"
}
```

**Response** (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "title": "Review pull requests",
    "description": "Check all pending PRs in the main repository",
    "priority": "high",
    "category": "work",
    "dueDate": "2026-06-25T00:00:00.000Z",
    "completed": 0,
    "createdAt": "2026-06-24T05:30:00.000Z",
    "updatedAt": "2026-06-24T05:30:00.000Z"
  }
}
```

**Validation Error** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Title is required"
}
```

**cURL**:
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review pull requests",
    "description": "Check all pending PRs",
    "priority": "high",
    "category": "work",
    "dueDate": "2026-06-25"
  }'
```

---

## 6. Update Todo

Update an existing todo. Supports partial updates — only provided fields are modified.

**Endpoint**: `PUT /api/todos/:id`

**Headers**: `Content-Type: application/json`

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The unique identifier of the todo |

**Request Body** (all fields optional):

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Updated task title |
| `description` | string | Updated description |
| `priority` | string | `low`, `medium`, `high`, `urgent` |
| `category` | string | Updated category |
| `dueDate` | string | Updated due date (ISO 8601) |
| `completed` | boolean | Updated completion status |

**Request Example**:
```json
{
  "title": "Review pull requests (URGENT)",
  "priority": "urgent"
}
```

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "title": "Review pull requests (URGENT)",
    "description": "Check all pending PRs in the main repository",
    "priority": "urgent",
    "category": "work",
    "dueDate": "2026-06-25T00:00:00.000Z",
    "completed": 0,
    "createdAt": "2026-06-24T05:30:00.000Z",
    "updatedAt": "2026-06-24T05:35:00.000Z"
  }
}
```

**cURL**:
```bash
curl -X PUT http://localhost:5000/api/todos/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated title", "priority": "urgent"}'
```

---

## 7. Toggle Completion

Toggle a todo's completion status (completed ↔ pending).

**Endpoint**: `PATCH /api/todos/:id/toggle`

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The unique identifier of the todo |

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "title": "Review pull requests",
    "completed": 1,
    "updatedAt": "2026-06-24T05:40:00.000Z"
  }
}
```

**cURL**:
```bash
curl -X PATCH http://localhost:5000/api/todos/f47ac10b-58cc-4372-a567-0e02b2c3d479/toggle
```

---

## 8. Delete Todo

Permanently delete a todo item.

**Endpoint**: `DELETE /api/todos/:id`

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The unique identifier of the todo |

**Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

**Error Response** (`404 Not Found`):
```json
{
  "success": false,
  "message": "Todo not found"
}
```

**cURL**:
```bash
curl -X DELETE http://localhost:5000/api/todos/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

---

## 9. Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "error": "Detailed error (development mode only)"
}
```

### HTTP Status Codes Used

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, PUT, PATCH, DELETE |
| `201` | Created | Successful POST (todo created) |
| `400` | Bad Request | Validation error (e.g., missing title) |
| `404` | Not Found | Todo with given ID doesn't exist |
| `500` | Internal Server Error | Unexpected server errors |

---

## 10. Data Model

### Todo Object

```json
{
  "id": "UUID v4 string",
  "title": "string (required)",
  "description": "string",
  "priority": "low | medium | high | urgent",
  "category": "string",
  "dueDate": "ISO 8601 date string | null",
  "completed": 0 | 1,
  "createdAt": "ISO 8601 datetime string",
  "updatedAt": "ISO 8601 datetime string"
}
```

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
  createdAt   TEXT NOT NULL,
  updatedAt   TEXT NOT NULL
);
```

### Priority Levels

| Level | Value | Sort Order | Color |
|-------|-------|------------|-------|
| Low | `low` | 4 | `#22c55e` (Green) |
| Medium | `medium` | 3 | `#f59e0b` (Amber) |
| High | `high` | 2 | `#f97316` (Orange) |
| Urgent | `urgent` | 1 | `#ef4444` (Red) |

### Default Categories

`general`, `work`, `personal`, `health`, `finance`, `learning`, `development`, `documentation`
