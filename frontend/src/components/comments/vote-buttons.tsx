"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiPost } from "@/lib/api";

interface VoteButtonsProps {
  commentId: number;
  score: number;
  userVote: number | null;
}

export default function VoteButtons({
  commentId,
  score: initialScore,
  userVote: initialVote,
}: VoteButtonsProps) {
  const { user } = useAuth();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialVote);

  async function vote(value: 1 | -1) {
    if (!user) return;
    try {
      const data = await apiPost<{ score: number; user_vote: number }>(
        `/comments/${commentId}/vote/`,
        { value }
      );
      setScore(data.score);
      setUserVote(data.user_vote);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => vote(1)}
        disabled={!user}
        className={`text-xs transition-colors ${
          userVote === 1
            ? "text-[var(--color-accent-400)]"
            : "text-gray-600 hover:text-gray-400"
        } disabled:cursor-default disabled:opacity-50`}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span
        className={`text-xs font-semibold ${
          score > 0
            ? "text-[var(--color-accent-400)]"
            : score < 0
              ? "text-red-400"
              : "text-gray-500"
        }`}
      >
        {score}
      </span>
      <button
        onClick={() => vote(-1)}
        disabled={!user}
        className={`text-xs transition-colors ${
          userVote === -1
            ? "text-red-400"
            : "text-gray-600 hover:text-gray-400"
        } disabled:cursor-default disabled:opacity-50`}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
