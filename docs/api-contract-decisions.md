# API Contract Decisions (v0)

This file captures the “why” behind the contract choices in `docs/api-contract.md` so future changes stay
intentional.

## Why a Markdown contract (for now)

- Fast to write and review.
- Keeps the focus on: **query params, response shapes, and pagination**.
- Easy to convert into OpenAPI later once the backend exists.

## Naming matches the current UI

The current dashboard reads mock data from `lib/data.ts` and expects fields like:

- Services: `uptime`, `p95Latency`, `errorRate`, `requestCount`
- Events: `latency`, `timestamp`, `statusCode`
- Incidents: `startTime`, `duration`, `isResolved`, embedded `alerts[]`

The contract intentionally uses the same names to minimize frontend refactors when wiring real data.

## Cursor pagination everywhere

Cursor pagination is the default choice because:

- Large tables (`api_logs`) make `OFFSET` pagination increasingly slow and inconsistent.
- It plays well with time-ordered data (events and incidents).

If you later want offset pagination for simplicity, constrain it to small tables and document the tradeoff.

## Incidents list embeds alerts (temporary)

`GET /incidents` currently returns `alerts[]` because the UI’s list view renders `incident.alerts.length`.

At scale, you will likely change list responses to:
- `alertCount` (number)
- maybe a small `alertsPreview` array

When you do, bump the contract version and update the UI accordingly.

## Severity mismatch: UI vs roadmap

- Current UI incident severities: `low | medium | high | critical`
- Roadmap incident severities: `warning | critical`

For v0, the contract matches the UI to reduce churn.
When you implement the backend incident engine per the roadmap, you can either:

1) Keep UI severity levels (map backend `warning/critical` into `medium/critical`), or
2) Update the UI to use `warning/critical` (and bump contract version).

Either is fine — the important part is choosing one and keeping it consistent across UI, API, and DB.

