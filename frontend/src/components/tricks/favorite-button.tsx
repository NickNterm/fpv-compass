"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiDelete, apiPost } from "@/lib/api";

interface FavoriteButtonProps {
  slug: string;
  initialFavorited: boolean;
  initialCount: number;
  onToggle?: (favorited: boolean) => void;
}

export default function FavoriteButton({
  slug,
  initialFavorited,
  initialCount,
  onToggle,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  async function toggle() {
    if (!user) return;
    setLoading(true);
    const optimisticNext = !favorited;
    setFavorited(optimisticNext);
    setCount((c) => c + (optimisticNext ? 1 : -1));
    try {
      if (optimisticNext) {
        await apiPost(`/tricks/${slug}/favorite/`);
      } else {
        await apiDelete(`/tricks/${slug}/favorite/`);
      }
      onToggle?.(optimisticNext);
    } catch {
      // revert
      setFavorited(!optimisticNext);
      setCount((c) => c + (optimisticNext ? -1 : 1));
    } finally {
      setLoading(false);
    }
  }

  // Everyone sees the count. Only signed-in users can toggle.
  const interactive = Boolean(user);
  const Tag = interactive ? "button" : "span";

  return (
    <Tag
      {...(interactive
        ? {
            onClick: toggle,
            disabled: loading,
            type: "button" as const,
            "aria-pressed": favorited,
            title: favorited ? "Remove from favorites" : "Save for later",
          }
        : { title: `${count} saved this trick` })}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        favorited
          ? "border-pink-500/40 bg-pink-500/10 text-pink-400"
          : "border-gray-700 bg-gray-800/50 text-gray-400"
      } ${interactive ? "hover:border-pink-500/60 hover:text-pink-300 disabled:opacity-50" : "cursor-default"}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{count}</span>
    </Tag>
  );
}
