# Blog Board — Design Spec

**Date:** 2026-06-08
**Status:** Approved

## Goal

A simple community blog board at `/blog`: any logged-in user can publish a post
with a markdown body; everyone can upvote/downvote. Reddit-style. Mirrors the
existing `ideas` board, minus category/status/comments.

## Decisions

- **Who posts:** any logged-in user (community board).
- **Route / nav:** `/blog`, nav label "Blog".
- **Comments:** none (posts + voting only).
- **Markdown:** full GFM via `react-markdown` + `remark-gfm`, sanitized (no
  `rehype-raw`, so raw HTML is escaped — XSS-safe for user content).

## Backend — new Django app `blog`

Cloned from `ideas`, dropping `category`, `status`, and comments.

**Models** (`blog/models.py`)
- `Post`: `title` (CharField 200), `body` (TextField, raw markdown), `user` FK
  (`related_name="posts"`), `created_at`, `updated_at`,
  `ordering = ["-created_at"]`, `computed_vote_count` property.
- `PostVote`: `user`, `post` FK (`related_name="votes"`), `value` SmallInt
  (1/-1), `unique_together(user, post)`.

**API**
- `GET  /api/blog/posts/` — list, annotated `vote_count` + `user_vote`,
  `?sort=votes|newest`.
- `POST /api/blog/posts/create/` — auth required; author auto-upvoted (1).
- `GET  /api/blog/posts/<id>/` — detail.
- `POST /api/blog/posts/<id>/vote/` — auth; value 1/-1; `update_or_create`.

Register `Post`/`PostVote` in admin. Register app in `INSTALLED_APPS` and
root `urls.py`.

## Frontend

- `/blog` — server-rendered (`force-dynamic`, seeds initial posts for SEO, same
  as `/ideas`) → `BlogBoard` client component: vote arrows + score, sort toggle
  (Top / New), title + author + body snippet, `[+ New Post]` for logged-in users.
- `/blog/[id]` — post detail: full markdown body rendered, vote control,
  author/date.
- `/blog/new` — compose page (logged-in only): title + markdown textarea with a
  live preview tab.
- `MarkdownBody` component — `react-markdown` + `remark-gfm`, no `rehype-raw`.
- "Blog" nav link in `header.tsx`.
- `Post`/`PostDetail` types; `api.ts` + `server-api.ts` helpers.

## Testing

Django tests for the `blog` app: create requires auth, author auto-upvote, vote
toggle/update, list sort by votes vs newest.
