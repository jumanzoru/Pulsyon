# Pulsyon

Pulsyon is a backend systems engineering project for telemetry ingestion and incident analysis. It explores relational schema design, SQL query performance, REST API development, asynchronous processing, and system evolution through a phased V1 → V4 architecture.

Built as part of the Google Software Engineering Program (BASTA G-SWEP), with mentorship from a Google software engineer.

---

## Overview

Pulsyon simulates the backend of a developer-facing observability tool. It is designed to answer:

- Are my services healthy?
- What events are happening in my system?
- How does performance change under load?
- (Later) What incidents are currently active and why?

The project is intentionally built in stages. Each version is independently runnable and introduces a new layer of system complexity.

---

## Current Status

**Current Implementation: V1: Foundation**

V1 focuses on:
- PostgreSQL schema design and migrations
- SQL query development and validation
- REST API with basic CRUD endpoints
- Seed data generation
- Query performance analysis using `EXPLAIN ANALYZE`

Not included yet:
- Redis / async processing
- background workers
- incident detection
- deployment / containerization

---

## Architecture by Version

### V1: Foundation
- relational schema (PostgreSQL)
- core tables and indexing
- CRUD + query endpoints
- seed data + analytics queries
- performance baseline analysis

### V2: Async Pipeline
- Redis-based ingestion
- background worker(s)
- dead-letter handling
- authentication + multi-tenancy

### V3: Intelligence Layer
- aggregation pipelines
- anomaly detection
- incident grouping logic
- analytics endpoints
- caching + load testing
- lightweight dashboard

### V4: Production
- Docker / containerization
- CI/CD with GitHub Actions
- cloud deployment (GCP Cloud Run)
- system monitoring and reliability improvements

---

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Queue / Cache:** Redis (introduced in V2/V3)
- **Performance Testing:** k6
- **Deployment:** Docker, GitHub Actions, GCP Cloud Run
- **Documentation:** ADRs, architecture diagrams, performance reports

---

## Core Data Model

Pulsyon is built around a structured telemetry and analytics schema:

- `users`: authentication and roles
- `services`: registered systems emitting events
- `api_logs`: raw telemetry events (partitioned)
- `service_health`: computed service metrics
- `metrics_hourly`: aggregated performance data
- `incidents`: grouped anomaly events (V3)
- `alerts`: individual anomaly triggers (V3)
- `failed_events`: dead-letter storage (V2)

In V1, the focus is validating schema design and query performance before introducing asynchronous infrastructure.

---

## Running Locally (V1)

### Prerequisites
- Node.js
- PostgreSQL

### Setup

```bash
git clone <repo-url>
cd pulsyon
npm install
npm run migrate
npm run seed
npm run dev
