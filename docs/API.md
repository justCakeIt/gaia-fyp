# G.a.i.A. API (MVP)

## Overview

**G.a.i.A. — Green AI Alchemy** is a non-diagnostic wellness support system designed to assist users in building supportive lifestyle routines based on known health conditions.

This API powers the MVP workflow:

**Search → Match → Recommendations → Create Plan → Schedule Reminders**

### Backend Stack

- Node.js + Express ^4.22.1
- MySQL 8
- Docker Compose
- REST architectural principles

The API is designed for integration with a Single Page Application (SPA) frontend.

---

## Base URL

Local development (Docker):

http://localhost:3000/api

---

## Standard Response Format

All endpoints return JSON using a consistent structure.

### Success Response

```json
{
  "ok": true,
  "data": {}
}
```

### Error Response

```json
{
  "ok": false,
  "error": "Human readable message"
}
```

### HTTP Status Codes

| Code | Description |
|------|------------|
| 200  | Request successful |
| 201  | Resource created |
| 400  | Client validation error |
| 401  | Unauthorised (invalid credentials) |
| 404  | Resource not found |
| 500  | Internal server error |
| 503  | Database temporarily unreachable |

---

# Authentication

---

## Login

Authenticates an existing local account and returns the user record.

### Endpoint

POST /api/auth/login

### Request Body

```json
{
  "email": "user@example.com",
  "password": "Secret123"
}
```

### Response

```json
{
  "ok": true,
  "data": {
    "userID": 1,
    "email": "user@example.com",
    "userName": "Alice"
  }
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| 400    | Missing or malformed email / password |
| 401    | `{ "ok": false, "error": "Invalid credentials" }` |
| 503    | Database unreachable |

---

## Register

Creates a new local account.

### Endpoint

POST /api/auth/register

### Request Body

```json
{
  "email": "user@example.com",
  "password": "Secret123",
  "name": "Alice"
}
```

#### Password Rules

- 8 – 72 characters
- Must include at least one uppercase letter, one lowercase letter, and one digit

### Response

```json
{
  "ok": true,
  "data": {
    "userID": 2,
    "email": "user@example.com",
    "userName": "Alice"
  }
}
```

HTTP status `201 Created` on success.

### Error Responses

| Status | Condition |
|--------|-----------|
| 400    | Validation failure (missing fields, weak password, duplicate email) |
| 503    | Database unreachable |

---

## Google Sync

Upserts a Google-authenticated user. Creates the account on first call; returns the existing record on subsequent calls.

### Endpoint

POST /api/auth/google-sync

### Request Body

```json
{
  "email": "user@gmail.com",
  "name": "Alice"
}
```

### Response

```json
{
  "ok": true,
  "data": {
    "userID": 3,
    "email": "user@gmail.com",
    "userName": "Alice",
    "created": false
  }
}
```

`created` is `true` when a new account was created, `false` when an existing account was matched.

### Error Responses

| Status | Condition |
|--------|-----------|
| 400    | Missing or invalid email |
| 503    | Database unreachable |

---

# Health Endpoints

## GET /api

Checks API availability.

### Response

```json
{
  "ok": true,
  "api": "up"
}
```

---

## GET /api/health

Checks database connectivity.

### Response

```json
{
  "ok": true,
  "db": "up"
}
```

---

# Conditions

## Search Conditions

Searches conditions by name or category.

### Endpoint

GET /api/conditions?query=liver

### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| query | No | Search phrase |

If `query` is empty, a default limited list is returned.

### Example Response

```json
{
  "ok": true,
  "data": [
    {
      "conditionID": 1,
      "conditionName": "Fatty Liver (MASLD)",
      "description": "...",
      "category": "Liver"
    }
  ]
}
```

---

## Match Condition

Attempts to identify a condition based on user input.

### Endpoint

GET /api/conditions/match?query=nafld

### Matching Strategy

1. Exact synonym match  
2. Condition name similarity fallback  

### Example Response

```json
{
  "ok": true,
  "matched": {
    "conditionID": 1,
    "conditionName": "Fatty Liver (MASLD)",
    "matchType": "synonym",
    "matchedOn": "nafld"
  }
}
```

The `matched` field may be `null` if no condition is found.

---

## Condition Recommendations

Returns wellness guidance associated with a condition.

### Endpoint

GET /api/conditions/:id/recommendations

Example:

GET /api/conditions/1/recommendations

### Returned Data

- Condition metadata
- Linked herbs
- Linked recipes
- Derived mixtures
- Aggregated safety notes

### Response Structure

```json
{
  "ok": true,
  "data": {
    "condition": {},
    "herbs": [],
    "recipes": [],
    "mixtures": [],
    "safetyNotes": []
  }
}
```

---

# Plans

Plans represent personalised wellness routines.

Each plan may include:

- Herbs
- Recipes
- Mixtures

Each plan item must reference **exactly one** entity.

---

## Create Plan

### Endpoint

POST /api/plans

### Request Body

```json
{
  "userID": 1,
  "conditionID": 1,
  "title": "Liver support plan",
  "items": [
    {
      "itemType": "herb",
      "herbID": 1,
      "scheduleHint": "morning"
    }
  ]
}
```

### Validation Rules

- `userID` is required
- `title` is required
- `itemType` must be `herb | recipe | mixture`
- Exactly one entity ID must be provided per item
- Referenced entities must exist

### Response

```json
{
  "ok": true,
  "data": {
    "planID": 5
  }
}
```

---

## List Plans

Returns all plans belonging to a user.

### Endpoint

GET /api/plans?userID=1

---

## Get Plan Details

Returns full plan structure including items and aggregated safety notes. Requires the owning user's ID for an ownership check.

### Endpoint

GET /api/plans/:planID?userID=1

### Error Responses

| Status | Condition |
|--------|-----------|
| 403 | `userID` does not own this plan |
| 404 | Plan not found |

---

## Delete Plan

Permanently removes a saved plan. Related `PlanItems` are removed via cascade. Related `Reminders` have their `planID` set to `NULL` but are not deleted.

### Endpoint

DELETE /api/plans/:planID?userID=1

### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| userID | Yes | Must match the plan owner |

### Response

```json
{
  "ok": true
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| 400 | `planID` is invalid or `userID` is missing |
| 403 | `userID` does not own this plan |
| 404 | Plan not found |

---

# Reminders

Reminders schedule routine notifications linked to plans.

---

## Create Reminder

### Endpoint

POST /api/reminders

### Request Body

```json
{
  "userID": 1,
  "planID": 5,
  "label": "Morning routine",
  "remindTime": "08:30:00",
  "dayOfWeek": "Daily",
  "enabled": true
}
```

### Response

```json
{
  "ok": true,
  "data": {
    "reminderID": 3
  }
}
```

---

## List Reminders

Returns reminders with associated plan titles.

### Endpoint

GET /api/reminders?userID=1

---

## Delete Reminder

Permanently removes a reminder by ID. The caller must supply the owning user's ID to prevent cross-user deletion.

### Endpoint

DELETE /api/reminders/:id?userID=1

### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| userID | Yes | Must match the reminder owner |

### Response

```json
{
  "ok": true
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| 400 | `id` is not a valid positive integer, or `userID` is missing |
| 403 | `userID` does not own this reminder |
| 404 | Reminder not found |

---

# Error Handling

A centralized middleware handles API errors.

### Client Errors Include

- Invalid IDs
- Missing required fields
- Invalid item types
- Non-existing referenced entities

### Server Errors

Internal errors are masked to prevent exposure of implementation details.

---

# Development

Start the environment:

```bash
docker compose up --build
```

### CORS

The backend allows cross-origin requests from the following origins by default:

- `http://localhost:5173` (Vite dev server)
- `http://localhost:3001` (Next.js dev server)
- `http://localhost:3000` (backend / static build)

To override, set a comma-separated `CORS_ORIGIN` environment variable before starting the server:

```
CORS_ORIGIN=http://localhost:3001,http://localhost:5173
```

Example PowerShell test commands:

```powershell
Invoke-RestMethod "http://localhost:3000/api/health"
Invoke-RestMethod "http://localhost:3000/api/conditions?query=liver"
```

---

# MVP Scope

This system:

- Does **not** provide medical diagnosis
- Provides wellness support guidance only
- Is structured for SPA frontend integration