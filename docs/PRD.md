# FPV Compass — Product Requirements Document

## Overview

FPV Compass is a curated trick dictionary and progression roadmap for FPV freestyle drone pilots. It organizes the world's existing FPV trick tutorials (YouTube videos) into a structured, browsable skill tree so pilots always know what to learn next.

**Domain:** fpv-compass.pamelesxi.gr

## Core Problem

FPV trick tutorials exist across hundreds of YouTube channels with no structure. Pilots don't know which trick to learn next, which video is best for their level, or what prerequisites a trick requires. They end up stuck repeating the same moves or attempting tricks they're not ready for.

## Target Users

1. **Beginner pilots** — Just learned to fly, want a clear progression path from first flip to advanced tricks
2. **Intermediate pilots** — Can do basic tricks, want to know what's next and how to learn it efficiently

## Scope

### In Scope (MVP)

- **Freestyle tricks only** (cinematic, racing, whoops are future phases)
- Trick catalog with tree view and list view
- User authentication (email/password)
- Comment system (Reddit-style: nested replies, upvote/downvote)
- Community trick submissions (separate section, admin can promote to official tree)
- Admin panel for content management and trick promotion

### Out of Scope

- Original video content (we link to YouTube only)
- Mobile app (responsive web only)
- AI chatbot / symptom search
- Paid tier / subscriptions (v1 is free)
- Social login (Google, etc.)
- Other FPV styles (cinematic, racing, whoops)

---

## Features

### F1: Trick Catalog

Each trick has:
- **Name** — e.g. "Power Loop", "Split-S", "Matty Flip"
- **Description** — What the trick is, 1-2 sentences
- **Difficulty** — Numeric 1-10
- **Phase** — Grouping label (e.g. "Foundations", "Basic Tricks", "Intermediate")
- **Prerequisites** — Links to other tricks that should be learned first (forms the tree)
- **Pro tip** — Short actionable advice (e.g. "Start in the sim. Practice over a single tree in VelociDrone")
- **Videos** — One or more YouTube links, each with:
  - Video title
  - Channel name
  - Duration
  - Optional timestamp (jump to the relevant moment)
- **Tags** — Optional searchable tags

Content is curated manually by the admin (you).

### F2: Two Browse Modes

1. **Tree View** — Visual skill tree showing tricks as nodes connected by prerequisite edges, grouped by phase. The landing page mockup shows this: Phase 1 (Foundations) -> Phase 2 (Basic Tricks) -> Phase 3 (Intermediate). Tricks within a phase are shown side-by-side. Prerequisite arrows connect them.

2. **List View** — Flat list of all tricks, sorted by difficulty (ascending). Filterable by phase. Searchable by name.

### F3: User Authentication

- Email/password registration and login
- Django session-based auth
- Password reset via email
- User profile with display name

### F4: Progress Tracking

- Logged-in users can mark tricks as "learned"
- Progress visible on both tree view (green checkmark) and list view
- Progress summary: "5 / 12 tricks completed" with progress bar (as shown in landing mockup sidebar)

### F5: Comments

Reddit-style per trick:
- Nested/threaded replies (at least 2 levels deep)
- Upvote / downvote on each comment
- Comments sorted by score (highest first), with option to sort by newest
- Only logged-in users can comment and vote
- Users can edit/delete their own comments

### F6: Community Trick Submissions

- Logged-in users can submit a trick (name, description, difficulty, video links)
- Submissions go to a separate "Community Tricks" section visible to all
- Admin can review and promote a community trick into the official tree via admin panel
- Community tricks are NOT shown in the tree view — only in a separate community tab/page

### F7: Admin Panel

Django admin (no custom admin UI needed for MVP):
- CRUD operations on tricks, videos, phases
- Manage trick prerequisites (tree structure)
- Review and promote community-submitted tricks to the official tree
- Moderate comments (delete/hide)
- Manage users

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (React, SSR) |
| Backend API | Django + Django REST Framework |
| Database | PostgreSQL |
| Auth | Django built-in auth (session-based), exposed via DRF |
| Deployment | Docker containers (docker-compose), pushed to private registry |
| Hosting | VPS (user's own) |
| Reverse proxy | Handled outside containers (user manages nginx/Traefik on VPS) |

### Architecture

```
[Browser] <-> [Next.js container (SSR + static)] <-> [Django container (API)] <-> [PostgreSQL container]
```

- Next.js handles SSR, routing, and all frontend rendering
- Django serves a REST API only (no templates, no HTML rendering)
- PostgreSQL runs in its own container alongside Django
- All three services defined in a single docker-compose.yml
- No nginx inside the containers — the user handles reverse proxy at the VPS level

---

## Design

Based on the existing landing page (landing.html):

- **Dark theme** — Background: `#0a0f1e`, cards: `#111827`, borders: `gray-800`
- **Font** — Inter (400, 500, 600, 700, 800)
- **Accent color** — Emerald/green (`#10b981` / Tailwind emerald-500)
- **Secondary accent** — Orange for "currently learning" / active states
- **Trick card states:**
  - Completed: green accent border, checkmark
  - Currently learning: orange border, yellow text, subtle glow
  - Locked/future: gray, 45% opacity
- **Responsive** — Mobile and desktop. Cards stack vertically on mobile.
- **CSS framework** — Tailwind CSS

---

## Data Model (Conceptual)

```
Phase
  - id, name, order, description

Trick
  - id, name, slug, description, difficulty (1-10), pro_tip
  - phase (FK -> Phase)
  - prerequisites (M2M -> Trick, self-referential)
  - is_community (bool) — true for user-submitted, false for official
  - created_by (FK -> User, nullable)
  - created_at, updated_at

Video
  - id, trick (FK -> Trick)
  - youtube_url, title, channel_name, duration_seconds
  - timestamp_seconds (nullable — jump to specific moment)
  - order (display order within trick)

User (Django built-in, extended with profile)
  - display_name

UserProgress
  - user (FK -> User), trick (FK -> Trick)
  - learned_at (datetime)
  - unique_together: (user, trick)

Comment
  - id, trick (FK -> Trick), user (FK -> User)
  - parent (FK -> Comment, nullable — for nesting)
  - body (text)
  - created_at, updated_at

CommentVote
  - user (FK -> User), comment (FK -> Comment)
  - value (+1 or -1)
  - unique_together: (user, comment)
```

---

## Pages

| Route | Description | Auth Required |
|-------|-------------|:---:|
| `/` | Landing page (the existing landing.html converted to Next.js) | No |
| `/tricks` | List view — all official tricks sorted by difficulty | No |
| `/tree` | Tree view — visual skill tree | No |
| `/tricks/[slug]` | Trick detail — description, videos, pro tip, prerequisites, comments | No (comments require login) |
| `/community` | Community-submitted tricks list | No |
| `/community/submit` | Submit a new trick | Yes |
| `/login` | Login form | No |
| `/register` | Registration form | No |
| `/profile` | User's progress overview, comment history | Yes |

---

## API Endpoints (Draft)

```
GET    /api/phases/                    — List all phases with tricks
GET    /api/tricks/                    — List tricks (filterable: ?phase=, ?search=, ?community=true)
GET    /api/tricks/:slug/              — Trick detail with videos
GET    /api/tricks/:slug/comments/     — Comments for a trick
POST   /api/tricks/:slug/comments/     — Add comment (auth)
PATCH  /api/comments/:id/              — Edit own comment (auth)
DELETE /api/comments/:id/              — Delete own comment (auth)
POST   /api/comments/:id/vote/         — Upvote/downvote (auth)
POST   /api/tricks/:slug/progress/     — Mark as learned (auth)
DELETE /api/tricks/:slug/progress/     — Unmark as learned (auth)
GET    /api/progress/                  — User's learned tricks (auth)
POST   /api/community/submit/          — Submit community trick (auth)
POST   /api/auth/register/             — Register
POST   /api/auth/login/                — Login
POST   /api/auth/logout/               — Logout
GET    /api/auth/me/                   — Current user info (auth)
```
