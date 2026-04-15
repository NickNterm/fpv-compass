# Implementation Plan: FPV Compass

## Overview

Full-stack web application for FPV freestyle drone trick progression. Django REST API backend, Next.js App Router frontend, PostgreSQL database, all orchestrated via Docker Compose.

## Architecture

```
docker-compose.yml
├── nextjs       (Node 22, Next.js 15, port 3000)
├── django       (Python 3.12, Django 5.x + DRF, port 8000)
└── postgres     (PostgreSQL 16, port 5432)
```

Next.js proxies `/api/*` to Django via rewrites (same origin = no CORS/cookie issues).
External traffic hits Next.js on port 3000; Django is not directly exposed in production.

---

## Phase 1: Project Scaffolding and Docker Infrastructure

**Goal:** Three containers running with health checks. No application logic.

### Directory Structure

```
fpv-trictionary/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   └── fpvcompassbackend/
│       ├── settings.py
│       ├── urls.py
│       └── wsgi.py
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── src/app/
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── docker-compose.yml
├── .env.example
└── .gitignore
```

### Key Files

- **docker-compose.yml** — 3 services: postgres:16-alpine, django (build ./backend), nextjs (build ./frontend). Shared `app-network`. Django depends_on postgres, nextjs depends_on django.
- **backend/Dockerfile** — Python 3.12-slim, gunicorn. Dev override: `runserver`.
- **frontend/Dockerfile** — Node 22-alpine, multi-stage build with standalone output. Dev override: `npm run dev`.
- **frontend/next.config.ts** — `output: 'standalone'`, rewrites `/api/:path*` -> `http://django:8000/api/:path*`.
- **backend/requirements.txt** — django, djangorestframework, django-cors-headers, psycopg[binary], dj-database-url, gunicorn, django-filter.

### Verification

- `docker compose up --build` starts all 3 services
- `http://localhost:3000` shows Next.js placeholder
- `http://localhost:3000/api/health/` returns `{"status": "ok"}`

### Risk: Medium — Cookie/proxy config between Next.js and Django

---

## Phase 2: Django Models and Admin

**Goal:** Complete data model, migrations, Django admin for content management.

### Apps to Create

**`tricks` app:**
- `Phase` — name, order, description
- `Trick` — name, slug, description, difficulty (1-10), pro_tip, phase (FK), prerequisites (M2M self), is_community (bool), created_by (FK User), timestamps
- `Video` — trick (FK), youtube_url, title, channel_name, duration_seconds, timestamp_seconds, order
- `Tag` — name, slug. M2M with Trick.

**`accounts` app:**
- `UserProfile` — OneToOneField(User), display_name. Auto-created via post_save signal.

**`progress` app:**
- `UserProgress` — user (FK), trick (FK), learned_at. Unique together (user, trick).

**`comments` app:**
- `Comment` — trick (FK), user (FK), parent (FK self, nullable), body, timestamps
- `CommentVote` — user (FK), comment (FK), value (+1/-1). Unique together (user, comment).

### Admin Config

- TrickAdmin with VideoInline, filter_horizontal for prerequisites/tags, prepopulated slug
- PhaseAdmin with trick count
- CommentAdmin with score display

### Verification

- Migrations run cleanly
- All CRUD works via Django admin
- Can create tricks with prerequisites and videos

### Risk: Low

---

## Phase 3: Django REST API

**Goal:** All API endpoints functional and tested.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| GET | `/api/phases/` | No | Phases with nested tricks (for tree view) |
| GET | `/api/tricks/` | No | Trick list, filterable by phase/search/community |
| GET | `/api/tricks/<slug>/` | No | Trick detail with videos and prerequisites |
| POST | `/api/auth/register/` | No | Register new user |
| POST | `/api/auth/login/` | No | Login |
| POST | `/api/auth/logout/` | Yes | Logout |
| GET | `/api/auth/me/` | Yes | Current user info |
| GET | `/api/progress/` | Yes | User's learned tricks |
| POST | `/api/tricks/<slug>/progress/` | Yes | Mark as learned |
| DELETE | `/api/tricks/<slug>/progress/` | Yes | Unmark as learned |
| GET | `/api/tricks/<slug>/comments/` | No | Comments for trick |
| POST | `/api/tricks/<slug>/comments/` | Yes | Add comment |
| PATCH | `/api/comments/<id>/` | Yes | Edit own comment |
| DELETE | `/api/comments/<id>/` | Yes | Delete own comment |
| POST | `/api/comments/<id>/vote/` | Yes | Upvote/downvote |
| POST | `/api/community/submit/` | Yes | Submit community trick |

### Tests

- `tricks/tests/` — model tests, API tests (list, detail, filter, search)
- `accounts/tests/` — register, login, logout, me, duplicate email
- `comments/tests/` — CRUD, nesting, voting, ownership checks
- `progress/tests/` — toggle, list, idempotency

### Verification

- All endpoints return expected data
- Auth flow: register -> login -> me -> logout
- Test suite passes, 80%+ coverage

### Risk: Medium — CSRF handling for session auth

---

## Phase 4: Frontend Core (Layout, Auth, API Client)

**Goal:** Shared layout, working auth flow, API utility layer.

### Key Files

- **`src/lib/api.ts`** — Fetch wrapper with credentials, server-side variant that forwards cookies
- **`src/lib/types.ts`** — TypeScript interfaces for all API responses
- **`src/context/auth-context.tsx`** — Auth context: user, login, logout, register
- **`src/components/layout/header.tsx`** — Nav bar with links and auth state
- **`src/app/login/page.tsx`** and **`register/page.tsx`** — Auth forms
- **`src/components/ui/`** — Button, Card, Input, Badge components

### Verification

- Navigation renders on all pages
- Login/register flow works end-to-end
- Auth state persists across page refreshes

### Risk: Medium — SSR cookie forwarding

---

## Phase 5: Frontend Feature Pages

**Goal:** All user-facing pages functional.

### Pages

1. **Landing (`/`)** — Convert landing.html to React/Tailwind
2. **List view (`/tricks`)** — Trick cards sorted by difficulty, filterable by phase, searchable
3. **Tree view (`/tree`)** — Visual skill tree with phase groups and prerequisite connections
4. **Trick detail (`/tricks/[slug]`)** — Description, videos, pro tip, prerequisites, progress toggle, comments
5. **Community (`/community`)** — Community-submitted tricks list
6. **Submit (`/community/submit`)** — Trick submission form (auth required)
7. **Profile (`/profile`)** — Progress summary, completed tricks

### Key Components

- **`components/tree/skill-tree.tsx`** — Interactive tree visualization (highest complexity)
- **`components/comments/comment-section.tsx`** — Reddit-style comments with voting
- **`components/tricks/video-player.tsx`** — YouTube embed with timestamp support
- **`components/tricks/progress-button.tsx`** — Learned toggle with optimistic update

### Verification

- All pages render with real data from API
- Tree view shows connections between tricks
- Comments nest, vote, sort correctly

### Risk: HIGH — Tree view visualization is the most complex component

---

## Phase 6: Seed Data and Polish

**Goal:** Usable product with real freestyle trick content.

- **`backend/tricks/management/commands/seed_tricks.py`** — 15-20 starter tricks across 4 phases with videos
- **`backend/entrypoint.sh`** — Wait for postgres, migrate, collectstatic, create superuser
- Loading skeletons, error boundaries, 404 page
- SEO metadata (generateMetadata for trick pages)
- Lazy-load YouTube iframes

### Risk: Low

---

## Phase 7: Testing and Production Readiness

**Goal:** 80%+ test coverage, production Docker config.

- Backend: pytest + pytest-django, 80%+ coverage
- Frontend: vitest + React Testing Library, 80%+ coverage
- E2E: Playwright tests for critical flows
- **docker-compose.prod.yml** — No debug, gunicorn, standalone Next.js, restart policies, health checks
- Production Django settings: SECURE_*, ALLOWED_HOSTS from env

### Risk: Medium

---

## Dependency Graph

```
Phase 1 (Docker + Scaffolding)
    ↓
Phase 2 (Models + Admin)
    ↓
Phase 3 (REST API + Tests)
    ↓
Phase 4 (Frontend Core: Layout, Auth, API Client)
    ↓
Phase 5 (Feature Pages)
    ↓
Phase 6 (Seed Data + Polish)
    ↓
Phase 7 (Full Testing + Production Config)
```

## Key Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Session/CSRF cookies between containers | High | Next.js rewrites proxy on same origin — eliminates cross-origin issues. Test in Phase 1. |
| Tree view visualization | High | Start CSS-only (flexbox + SVG connectors). Evaluate reactflow if needed. Build last. |
| N+1 queries on nested comments | Medium | prefetch_related + annotate score. Limit nesting to 2 levels. |
| SSR cookie forwarding | Medium | Server-side API client reads from next/headers. Test in Phase 4. |
