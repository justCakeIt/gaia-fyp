# G.a.i.A. API (MVP)

## Overview

**G.a.i.A. — Green AI Alchemy** is a non-diagnostic wellness support system.

This API supports the MVP workflow:

Search → Match → Recommendations → Create Plan → Schedule Reminders

The backend is built using:

- Node.js (Express)
- MySQL 8
- Docker Compose
- REST architecture

This API is designed for frontend SPA integration.

---

## Base URL

Local development (Docker):

http://localhost:3000/api

---

## Standard Response Format

All endpoints return JSON in a consistent format.

### Success Response

{
  "ok": true,
  "data": {}
}

### Error Response

{
  "ok": false,
  "error": "Human readable message"
}

Client errors return HTTP 400–404.  
Server errors return HTTP 500.

---

# Health

## GET /api

Checks API availability.

Response:

{
  "ok": true,
  "api": "up"
}

---

## GET /api/health

Checks database connectivity.

Response:

{
  "ok": true,
  "db": "up"
}

---

# Conditions

## Search Conditions

GET /api/conditions?query=liver

Query Parameters:

- query (optional) — text search term

If query is empty, returns a default limited list.

Response:

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

---

## Match Condition

GET /api/conditions/match?query=nafld

Matching strategy:

1. Exact synonym match
2. Condition name similarity fallback

Response:

{
  "ok": true,
  "matched": {
    "conditionID": 1,
    "conditionName": "Fatty Liver (MASLD)",
    "matchType": "synonym",
    "matchedOn": "nafld"
  }
}

The "matched" field may be null if nothing is found.

---

## Condition Recommendations

GET /api/conditions/:id/recommendations

Example:

GET /api/conditions/1/recommendations

Returns:

- condition metadata
- linked herbs
- linked recipes
- linked mixtures
- aggregated safety notes

Response structure:

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

---

# Plans

Plans represent a personalised wellness routine.

Each plan may contain:

- herbs
- recipes
- mixtures

Each item must reference exactly one entity.

---

## Create Plan

POST /api/plans

Body:

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

Validation rules:

- userID is required
- title is required
- itemType must be herb | recipe | mixture
- exactly one ID must be provided per item
- referenced entities must exist

Response:

{
  "ok": true,
  "data": { "planID": 5 }
}

---

## List Plans

GET /api/plans?userID=1

Returns all plans belonging to a user.

---

## Get Plan Details

GET /api/plans/:planID

Returns:

- plan metadata
- plan items
- aggregated safety notes

---

# Reminders

Reminders schedule notifications linked to plans.

---

## Create Reminder

POST /api/reminders

Body:

{
  "userID": 1,
  "planID": 5,
  "label": "Morning routine",
  "remindTime": "08:30:00",
  "dayOfWeek": "Daily",
  "enabled": true
}

Response:

{
  "ok": true,
  "data": { "reminderID": 3 }
}

---

## List Reminders

GET /api/reminders?userID=1

Returns reminders with associated plan titles.

---

# Error Handling

A centralized middleware handles API errors.

Client errors include:

- invalid IDs
- missing required fields
- invalid item types
- non-existing referenced entities

Server errors are masked to prevent internal leakage.

---

# Development

Start environment:

docker compose up --build

Example test commands (PowerShell):

Invoke-RestMethod "http://localhost:3000/api/health"

Invoke-RestMethod "http://localhost:3000/api/conditions?query=liver"

---

# MVP Scope

This system:

- Does NOT provide medical diagnosis
- Provides wellness support guidance only
- Is structured for frontend SPA integration