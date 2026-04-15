"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { Idea, IdeaDetail, IdeaComment } from "@/lib/types";

const CATEGORIES = [
  { value: "feature", label: "Feature Request", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "improvement", label: "Improvement", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { value: "bug", label: "Bug Report", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { value: "other", label: "Other", color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
];

const STATUS_COLORS: Record<string, string> = {
  open: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  planned: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  in_progress: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  done: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  declined: "text-red-400 bg-red-500/10 border-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  planned: "Planned",
  in_progress: "In Progress",
  done: "Done",
  declined: "Declined",
};

function CategoryBadge({ category }: { category: string }) {
  const cat = CATEGORIES.find((c) => c.value === category);
  if (!cat) return null;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${cat.color}`}>
      {cat.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[status] || ""}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function VoteButton({
  idea,
  onVote,
}: {
  idea: Idea;
  onVote: (id: number, value: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={(e) => { e.stopPropagation(); onVote(idea.id, 1); }}
        className={`text-lg leading-none transition-colors ${
          idea.user_vote === 1
            ? "text-[var(--color-accent-400)]"
            : "text-gray-600 hover:text-gray-400"
        }`}
      >
        &#9650;
      </button>
      <span className="text-xs font-bold text-white">{idea.vote_count}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onVote(idea.id, -1); }}
        className={`text-lg leading-none transition-colors ${
          idea.user_vote === -1
            ? "text-red-400"
            : "text-gray-600 hover:text-gray-400"
        }`}
      >
        &#9660;
      </button>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function IdeaCard({
  idea,
  onVote,
  user,
}: {
  idea: Idea;
  onVote: (id: number, value: number) => void;
  user: { display_name: string } | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<IdeaComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [posting, setPosting] = useState(false);

  async function loadComments() {
    setLoadingComments(true);
    try {
      const detail = await apiGet<IdeaDetail>(`/ideas/${idea.id}/`);
      setComments(detail.comments);
    } catch {
      // ignore
    } finally {
      setLoadingComments(false);
    }
  }

  function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && comments.length === 0) {
      loadComments();
    }
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setPosting(true);
    try {
      const newComment = await apiPost<IdeaComment>(
        `/ideas/${idea.id}/comments/`,
        { body: commentBody }
      );
      setComments((prev) => [...prev, newComment]);
      setCommentBody("");
    } catch {
      // ignore
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-[#111827] transition-colors hover:border-gray-700">
      <div
        className="flex cursor-pointer gap-4 p-4"
        onClick={handleToggle}
      >
        <VoteButton idea={idea} onVote={onVote} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{idea.title}</h3>
            <CategoryBadge category={idea.category} />
            {idea.status !== "open" && <StatusBadge status={idea.status} />}
          </div>
          <p className={`text-xs leading-relaxed text-gray-500 ${expanded ? "" : "line-clamp-2"}`}>
            {idea.body}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-600">
            <span>{idea.author}</span>
            <span>{timeAgo(idea.created_at)}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleToggle(); }}
              className="text-gray-500 hover:text-gray-300"
            >
              {idea.comment_count} comment{idea.comment_count !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded comments section */}
      {expanded && (
        <div className="border-t border-gray-800 px-4 pb-4 pt-3">
          {loadingComments ? (
            <div className="py-3 text-center text-xs text-gray-600">Loading comments...</div>
          ) : comments.length === 0 ? (
            <p className="py-2 text-xs text-gray-600">No comments yet. Be the first to weigh in.</p>
          ) : (
            <div className="mb-3 space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="rounded-lg bg-[#0a0f1e] p-3">
                  <p className="text-xs leading-relaxed text-gray-400">{c.body}</p>
                  <p className="mt-1.5 text-[10px] text-gray-600">
                    {c.author} &middot; {timeAgo(c.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {user ? (
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Add a comment..."
                className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-[#0a0f1e] px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:border-[var(--color-accent-500)] focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="submit"
                disabled={posting || !commentBody.trim()}
                className="shrink-0 rounded-lg bg-[var(--color-accent-500)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-accent-600)] disabled:opacity-50"
                onClick={(e) => e.stopPropagation()}
              >
                {posting ? "..." : "Post"}
              </button>
            </form>
          ) : (
            <p className="text-xs text-gray-600">Log in to comment.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function IdeasPage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"votes" | "newest">("votes");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("feature");
  const [submitting, setSubmitting] = useState(false);

  async function loadIdeas() {
    try {
      let url = `/ideas/?sort=${sort}`;
      if (filterCategory) url += `&category=${filterCategory}`;
      const data = await apiGet<Idea[]>(url);
      setIdeas(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, filterCategory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await apiPost("/ideas/create/", { title, body, category });
      setTitle("");
      setBody("");
      setCategory("feature");
      setShowForm(false);
      await loadIdeas();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(ideaId: number, value: number) {
    if (!user) return;
    try {
      const res = await apiPost<{ vote_count: number; user_vote: number }>(
        `/ideas/${ideaId}/vote/`,
        { value }
      );
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideaId
            ? { ...i, vote_count: res.vote_count, user_vote: res.user_vote }
            : i
        )
      );
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Feature Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Help shape FPV Compass — suggest features, report bugs, or request improvements. Vote on ideas you want the dev team to build next.
          </p>
        </div>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="shrink-0 rounded-lg bg-[var(--color-accent-500)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-600)]"
          >
            {showForm ? "Cancel" : "Submit Idea"}
          </button>
        )}
      </div>

      {/* Submit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-gray-800 bg-[#111827] p-5"
        >
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-gray-400">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Add mobile app, Dark mode toggle, Filter by tag..."
              maxLength={200}
              className="w-full rounded-lg border border-gray-700 bg-[#0a0f1e] px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-accent-500)] focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-gray-400">
              Description
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What should change and why? How would this improve the site for pilots?"
              rows={4}
              className="w-full rounded-lg border border-gray-700 bg-[#0a0f1e] px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-accent-500)] focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-gray-400">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-gray-700 bg-[#0a0f1e] px-3 py-2 text-sm text-white focus:border-[var(--color-accent-500)] focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[var(--color-accent-500)] px-5 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-600)] disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Post Idea"}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-800 bg-[#111827] p-0.5">
          <button
            onClick={() => setSort("votes")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              sort === "votes"
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Top Voted
          </button>
          <button
            onClick={() => setSort("newest")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              sort === "newest"
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Newest
          </button>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-gray-800 bg-[#111827] px-3 py-1.5 text-xs text-gray-400 focus:border-[var(--color-accent-500)] focus:outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Ideas List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-800/50" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-[#111827] py-16 text-center">
          <p className="text-lg text-gray-500">No feature requests yet</p>
          <p className="mt-1 text-sm text-gray-600">
            {user ? "Be the first to suggest something!" : "Log in to submit a feature request."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onVote={handleVote}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
