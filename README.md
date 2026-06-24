# FPV Compass

A curated dictionary and skill tree for FPV freestyle drone tricks. Watch a trick, learn what you need before it, and always know what to practice next — each trick links to the best YouTube tutorials the community has already made.

Live at **[fpv-compass.xyz](https://www.fpv-compass.xyz)**.

> FPV Compass does not host original video content. It indexes and links to existing YouTube tutorials.

## Why

Freestyle has no roadmap. You watch a trick, try it, crash, and still don't know what to learn next. FPV Compass gives every trick a place in a skill tree — with prerequisites, a difficulty rating, a pro tip, and the tutorial videos that actually teach it.

## Features

- **Skill tree view** — tricks as nodes grouped by phase (Foundations → Basic → Intermediate → …), connected by prerequisites
- **List view** — flat, searchable, filterable, sorted by difficulty (1–10)
- **Progress tracking** — mark tricks as *learning* or *completed*; locked tricks are visually gated
- **Curated YouTube tutorials** per trick, with a pro tip from pilots who've landed it
- **Community submissions** — pilots propose new tricks; admins promote them into the official tree
- **Reddit-style comments** — nested replies, upvotes/downvotes per trick
- **Email/password auth** via Django sessions

## Tech Stack

```
[Browser] ⇄ [Next.js (SSR)] ⇄ [Django REST API] ⇄ [PostgreSQL]
```

- **Frontend** — Next.js (App Router, React, TypeScript, Tailwind CSS)
- **Backend** — Django + Django REST Framework (API only)
- **Database** — PostgreSQL
- **Deployment** — `docker compose` with three services (nextjs, django, postgres). Reverse proxy is handled at the VPS level.

## Project Structure

```
.
├── frontend/              # Next.js app (SSR, Tailwind)
├── backend/               # Django + DRF
│   ├── tricks/            # Tricks, phases, prerequisites, videos
│   ├── accounts/          # Auth
│   ├── comments/          # Nested comments + voting
│   ├── progress/          # Per-user trick progress
│   ├── favorites/
│   └── ideas/             # Community trick submissions
├── docker-compose.yml     # Local dev
├── docker-compose.prod.yml
└── docs/
    ├── PRD.md             # Product requirements, data model, API, routes
    └── PLAN.md            # Implementation plan
```

## Getting Started

Requirements: Docker + Docker Compose.

```bash
# Clone
git clone https://github.com/NickNterm/fpv-compass.git
cd fpv-compass

# Start everything (first run builds images)
docker compose up -d --build

# Run migrations
docker compose exec django python manage.py migrate

# Create an admin user
docker compose exec django python manage.py createsuperuser
```

Then open:

| Service    | URL                      |
| ---------- | ------------------------ |
| Next.js    | http://localhost:3001    |
| Django API | http://localhost:8001    |
| Admin      | http://localhost:8001/admin |

All browser API calls go through Next.js at `/api/*` and are proxied to Django.

## Common Commands

```bash
# Logs
docker compose logs -f              # all services
docker compose logs -f django
docker compose logs -f nextjs

# Django shell / tests
docker compose exec django python manage.py shell
docker compose exec django python manage.py test

# Stop everything
docker compose down

# Rebuild after Dockerfile / requirements changes
docker compose up -d --build
```

## Design

Dark theme, emerald-accented:

- Background `#0a0f1e`, cards `#111827`, borders `gray-800`
- Font: Inter
- States: **green** = completed, **orange** = learning, **gray @ 45%** = locked

## Core Concepts

- **Trick** — an FPV maneuver (e.g. Power Loop, Split-S) with description, difficulty, pro tip, and linked YouTube videos
- **Phase** — groups tricks by progression stage
- **Prerequisites** — tricks depend on other tricks, forming a directed skill tree
- **Community Trick** — user-submitted; admin-reviewed before joining the official tree

## Roadmap

MVP covers **freestyle** only. Future phases may add cinematic, racing, and long-range styles.

See [`docs/PRD.md`](docs/PRD.md) for the full product spec and [`docs/PLAN.md`](docs/PLAN.md) for the implementation plan.

## Contributing

Issues and PRs are welcome — especially:

- New tricks or better tutorial links
- Prerequisite corrections
- UI polish and accessibility fixes

Please open an issue before large changes so we can align on scope.

## License

Released under the [Apache License 2.0](LICENSE).
