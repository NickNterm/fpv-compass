"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { Post } from "@/lib/types";
import VoteControl from "@/components/blog/vote-control";

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

function PostCard({
  post,
  onVote,
  canVote,
}: {
  post: Post;
  onVote: (id: number, value: number) => void;
  canVote: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#111827] transition-colors hover:border-gray-700">
      <div className="flex gap-4 p-4">
        <VoteControl
          voteCount={post.vote_count}
          userVote={post.user_vote}
          onVote={(value) => onVote(post.id, value)}
          disabled={!canVote}
        />
        <Link href={`/blog/${post.id}`} className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white hover:text-[var(--color-accent-400)]">
            {post.title}
          </h3>
          <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-gray-500">
            {post.body}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-600">
            <span>{post.author}</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function BlogBoard({ initialPosts }: { initialPosts: Post[] }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [sort, setSort] = useState<"votes" | "newest">("votes");

  async function loadPosts() {
    try {
      const data = await apiGet<Post[]>(`/blog/posts/?sort=${sort}`);
      setPosts(data);
    } catch {
      // ignore — keep current posts
    }
  }

  const didMount = useRef(false);
  useEffect(() => {
    // Skip first run: initial posts are seeded from the server.
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  async function handleVote(postId: number, value: number) {
    if (!user) return;
    try {
      const res = await apiPost<{ vote_count: number; user_vote: number }>(
        `/blog/posts/${postId}/vote/`,
        { value },
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, vote_count: res.vote_count, user_vote: res.user_vote }
            : p,
        ),
      );
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Stories, guides, and hot takes from the FPV community. Post your own,
            and vote up the ones worth reading.
          </p>
        </div>
        {user && (
          <Link
            href="/blog/new"
            className="shrink-0 rounded-lg bg-[var(--color-accent-500)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-600)]"
          >
            + New Post
          </Link>
        )}
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex rounded-lg border border-gray-800 bg-[#111827] p-0.5">
          <button
            onClick={() => setSort("votes")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              sort === "votes"
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setSort("newest")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              sort === "newest"
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            New
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-800 bg-[#111827] p-10 text-center">
          <p className="text-sm text-gray-500">
            No posts yet.{" "}
            {user ? (
              <Link href="/blog/new" className="text-[var(--color-accent-400)] hover:underline">
                Write the first one.
              </Link>
            ) : (
              "Log in to write the first one."
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onVote={handleVote}
              canVote={!!user}
            />
          ))}
        </div>
      )}

      {!user && (
        <p className="mt-6 text-center text-xs text-gray-600">
          <Link href="/login" className="text-[var(--color-accent-400)] hover:underline">
            Log in
          </Link>{" "}
          to post and vote.
        </p>
      )}
    </div>
  );
}
