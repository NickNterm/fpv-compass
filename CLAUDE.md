# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FPV Compass** — A curated dictionary and skill tree of FPV freestyle drone tricks. Links to the best YouTube tutorials so pilots always know what to learn next.

**Domain:** www.fpv-compass.xyz (canonical; apex fpv-compass.xyz redirects)

This is NOT a content creation platform — it indexes and links to existing YouTube videos. No original video content.

## Architecture

```
[Browser] <-> [Next.js (SSR)] <-> [Django REST API] <-> [PostgreSQL]
```

- **Frontend:** Next.js (React, SSR, Tailwind CSS)
- **Backend:** Django + Django REST Framework (API only, no templates)
- **Database:** PostgreSQL (in Django's container)
- **Deployment:** docker-compose with 3 services (nextjs, django, postgres). No nginx inside containers — reverse proxy is handled at VPS level.
- **Auth:** Django session-based auth, exposed via DRF endpoints

## Design System

Dark theme inherited from `landing.html`:
- Background: `#0a0f1e`, Cards: `#111827`, Borders: `gray-800`
- Font: Inter
- Primary accent: emerald (`#10b981`)
- Active/learning state: orange
- Trick states: green (completed), orange (learning), gray at 45% opacity (locked)

## Key Concepts

- **Trick** — An FPV maneuver (e.g. Power Loop, Split-S) with description, difficulty 1-10, pro tip, and linked YouTube videos
- **Phase** — Groups tricks by progression stage (Foundations, Basic Tricks, Intermediate, etc.)
- **Prerequisites** — Tricks link to other tricks they depend on, forming a directed skill tree
- **Tree View** — Visual skill tree showing tricks as nodes connected by prerequisites, grouped by phase
- **List View** — Flat list sorted by difficulty, filterable and searchable
- **Community Tricks** — User-submitted tricks in a separate section; admin can promote to official tree

## Scope (MVP)

- Freestyle tricks only (other styles are future phases)
- Two browse modes: tree view and list view
- Email/password auth
- Reddit-style comments (nested replies, upvote/downvote)
- Progress tracking (mark tricks as learned)
- Community trick submissions with admin moderation
- Django admin for content management (no custom admin UI)

## Detailed Docs

- `docs/PRD.md` — Full product requirements, data model, API endpoints, page routes

## Build & Dev Commands

```bash
# Start all services (first time builds images)
docker compose up -d --build

# View logs
docker compose logs -f            # all services
docker compose logs -f django     # django only
docker compose logs -f nextjs     # nextjs only

# Run Django management commands
docker compose exec django python manage.py migrate
docker compose exec django python manage.py createsuperuser
docker compose exec django python manage.py shell

# Run Django tests
docker compose exec django python manage.py test

# Stop everything
docker compose down

# Rebuild after Dockerfile/requirements changes
docker compose up -d --build
```

## Dev Ports

| Service | Internal | Host |
|---------|----------|------|
| Next.js | 3000 | 3001 |
| Django | 8000 | 8001 |
| PostgreSQL | 5432 | 5432 |

API proxy: `http://localhost:3001/api/*` -> Django. All API calls from the browser go through Next.js.

## Detailed Docs

- `docs/PRD.md` — Full product requirements, data model, API endpoints, page routes
- `docs/PLAN.md` — Implementation plan with phases and risk assessment
