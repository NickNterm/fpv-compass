"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiGet } from "@/lib/api";
import type { Comment } from "@/lib/types";
import CommentThread from "./comment-thread";
import CommentForm from "./comment-form";

interface CommentSectionProps {
  slug: string;
}

export default function CommentSection({ slug }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [sort, setSort] = useState<"score" | "newest">("score");
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const data = await apiGet<Comment[]>(
        `/tricks/${slug}/comments/?sort=${sort}`
      );
      setComments(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug, sort]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">
          Comments ({comments.length})
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setSort("score")}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              sort === "score"
                ? "bg-gray-800 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setSort("newest")}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              sort === "newest"
                ? "bg-gray-800 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Newest
          </button>
        </div>
      </div>

      {user && (
        <div className="mb-6">
          <CommentForm slug={slug} onSubmitted={fetchComments} />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-800/50" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-600">
          No comments yet. {user ? "Be the first!" : "Log in to comment."}
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              slug={slug}
              onUpdated={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
