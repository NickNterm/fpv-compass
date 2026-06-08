"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { PostDetail } from "@/lib/types";
import VoteControl from "@/components/blog/vote-control";
import MarkdownBody from "@/components/blog/markdown-body";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PostView({ post }: { post: PostDetail }) {
  const { user } = useAuth();
  const [voteCount, setVoteCount] = useState(post.vote_count);
  const [userVote, setUserVote] = useState<number | null>(post.user_vote);

  async function handleVote(value: number) {
    if (!user) return;
    try {
      const res = await apiPost<{ vote_count: number; user_vote: number }>(
        `/blog/posts/${post.id}/vote/`,
        { value },
      );
      setVoteCount(res.vote_count);
      setUserVote(res.user_vote);
    } catch {
      // ignore
    }
  }

  return (
    <article className="flex gap-4">
      <div className="pt-1">
        <VoteControl
          voteCount={voteCount}
          userVote={userVote}
          onVote={handleVote}
          disabled={!user}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold text-white">{post.title}</h1>
        <div className="mt-1.5 mb-5 flex items-center gap-2 text-xs text-gray-600">
          <span>{post.author}</span>
          <span>&middot;</span>
          <span>{formatDate(post.created_at)}</span>
        </div>
        <MarkdownBody>{post.body}</MarkdownBody>
        {!user && (
          <p className="mt-6 text-xs text-gray-600">
            Log in to vote on this post.
          </p>
        )}
      </div>
    </article>
  );
}
