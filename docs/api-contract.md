# Pulsyon API Contract (v0)

This document locks the **HTTP interface** between the dashboard (this Next.js app) and the future backend.
It is intentionally small and practical: it matches what the current UI renders today while staying aligned
with the roadmap endpoints (metrics, events, incidents, dead-letter, ingestion).

Status: **draft, but binding** — update via PRs, not ad-hoc changes.

## Goals

- Let the frontend swap `lib/data.ts` for real API data with minimal refactors.
- Keep endpoints aligned with the roadmap so your project narrative stays consistent.
- Make pagination, filtering, timestamps, and error shapes explicit up front.

## Non-goals (for v0)

- Perfect OpenAPI coverage (you can add it later).
- Final auth and multi-tenant semantics (documented as “later” endpoints below).

## Conventions

- Base URL (local): `http://localhost:3001`
- Content type: `application/json`
- Timestamps: ISO-8601 UTC strings (e.g. `"2026-03-31T18:20:00.000Z"`)
- IDs: opaque strings (don’t encode meaning in the ID format)
- Errors:
  - Status codes: `400, 401, 403, 404, 409, 429, 500`
  - Response body shape:
    ```json
    {
      "error": {
        "code": "string",
        "message": "string",
        "details": {}
      }
    }
    ```

## Pagination (cursor-based)

All list endpoints use cursor pagination:

- Request: `limit` (default 20, max 100), `cursor` (optional)
- Response: `items` + `nextCursor` (string or `null`)

Cursor rules:
- Treat cursors as opaque.
- If filters change, reset cursor client-side.

---

# Metrics

## GET /metrics/overview

Used by: `app/page.tsx` (Service Overview)

Query
- `window`: `"15m" | "1h" | "6h" | "24h"` (default `"1h"`)

Response `200`
```json
{
  "asOf": "2026-03-31T18:20:00.000Z",
  "services": [
    {
      "id": "payments",
      "name": "Payment Service",
      "status": "healthy",
      "uptime": 99.12,
      "p95Latency": 892,
      "errorRate": 1.24,
      "requestCount": 234567
    }
  ]
}
```

Notes
- Field names intentionally match the current `Service` type in `lib/data.ts`.
- `status` is derived server-side (e.g. from metrics thresholds or health snapshots).

---

# Events

## GET /events

Used by: `app/events/page.tsx` (Event Explorer)

Query
- `service`: `"all" | string` (default `"all"`)
- `statusClass`: `"all" | "2xx" | "4xx" | "5xx"` (default `"all"`)
- `window`: `"15m" | "1h" | "6h" | "24h"` (default `"1h"`)
- `limit`: number (default 20, max 100)
- `cursor`: string (optional)

Response `200`
```json
{
  "items": [
    {
      "id": "evt_123",
      "timestamp": "2026-03-31T18:20:00.000Z",
      "service": "payments",
      "endpoint": "/api/v1/checkout",
      "statusCode": 503,
      "latency": 1200
    }
  ],
  "nextCursor": null
}
```

Notes
- Field names intentionally match the current `Event` type in `lib/data.ts`.
- If you later add “click row to see full payload”, define `GET /events/:id`.

---

# Incidents

## GET /incidents

Used by: `app/incidents/page.tsx` (Incidents list)

Query
- `service`: `"all" | string` (default `"all"`)
- `resolved`: `"all" | "true" | "false"` (default `"all"`)
- `limit`: number (default 50, max 100)
- `cursor`: string (optional)

Response `200`
```json
{
  "items": [
    {
      "id": "inc_47",
      "service": "payments",
      "type": "latency_spike",
      "severity": "high",
      "startTime": "2026-03-31T18:00:00.000Z",
      "duration": 47,
      "isResolved": false,
      "alerts": [
        {
          "id": "alert_001",
          "timestamp": "2026-03-31T18:01:00.000Z",
          "message": "P95 latency exceeded 800ms threshold",
          "level": "warning"
        }
      ]
    }
  ],
  "nextCursor": null
}
```

Notes
- This matches the current `Incident` type in `lib/data.ts`, including an embedded `alerts[]`.
- For performance at scale, you will likely **stop embedding `alerts` in list responses** and instead return
  `alertCount` + a preview. If/when you do that, update the UI and bump this contract version.

## GET /incidents/:id

Used by: `app/incidents/[id]/page.tsx` (Incident detail)

Response `200`
```json
{
  "incident": {
    "id": "inc_47",
    "service": "payments",
    "type": "latency_spike",
    "severity": "high",
    "startTime": "2026-03-31T18:00:00.000Z",
    "duration": 47,
    "isResolved": false,
    "alerts": [
      {
        "id": "alert_001",
        "timestamp": "2026-03-31T18:01:00.000Z",
        "message": "P95 latency exceeded 800ms threshold",
        "level": "warning"
      }
    ]
  }
}
```

## GET /incidents/summary

Used by: (optional header stats / later)

Query
- `window`: `"24h" | "7d" | "30d"` (default `"7d"`)

Response `200`
```json
{
  "openCount": 3,
  "criticalCount": 1,
  "mttrMinutes": 34,
  "mostIncidentProneService": "payments"
}
```

---

# Dead-letter (Admin)

## GET /admin/failed-events

Used by: (admin-only panel; not present in current UI)

Query
- `service`: `"all" | string` (default `"all"`)
- `limit`: number (default 50, max 100)
- `cursor`: string (optional)

Response `200`
```json
{
  "items": [
    {
      "id": "fail_123",
      "failedAt": "2026-03-31T18:20:00.000Z",
      "service": "payments",
      "reason": "validation_error",
      "retryCount": 3
    }
  ],
  "nextCursor": null
}
```

---

# Ingestion

## POST /ingest

Used by: simulators / load tests

Request (example)
```json
{
  "service": "payments",
  "timestamp": "2026-03-31T18:20:00.000Z",
  "endpoint": "/api/v1/checkout",
  "statusCode": 503,
  "latencyMs": 1200,
  "traceId": "trace_abc123",
  "requestId": "req_abc123"
}
```

Response
- `202 Accepted` (no body) OR:
  ```json
  { "accepted": true }
  ```

Notes
- The dashboard does not call this endpoint.
- The backend should validate and enqueue; do not block on DB writes.

---

# Authentication + Multi-tenancy (later)

These endpoints are not required to wire the current UI, but are part of the roadmap.

## POST /auth/register
## POST /auth/login
## POST /services

When you add auth:
- All read endpoints should become tenant-scoped.
- `/admin/*` must require an admin role.

