"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiDelete, apiPatch, apiPost } from "@/lib/api";
import type { Comment } from "@/lib/types";
import CommentForm from "./comment-form";
import VoteButtons from "./vote-buttons";

interface CommentThreadProps {
  comment: Comment;
  slug: string;
  onUpdated: () => void;
  isReply?: boolean;
}

export default function CommentThread({
  comment,
  slug,
  onUpdated,
  isReply = false,
}: CommentThreadProps) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);

  async function handleEdit() {
    await apiPatch(`/comments/${comment.id}/`, { body: editBody });
    setEditing(false);
    onUpdated();
  }

  async function handleDelete() {
    await apiDelete(`/comments/${comment.id}/`);
    onUpdated();
  }

  const timeAgo = getTimeAgo(comment.created_at);

  return (
    <div className={isReply ? "ml-8 border-l border-gray-800 pl-4" : ""}>
      <div className="flex gap-3">
        <VoteButtons
          commentId={comment.id}
          score={comment.score}
          userVote={comment.user_vote}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-gray-300">{comment.author}</span>
            <span className="text-gray-600">{timeAgo}</span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-gray-700">(edited)</span>
            )}
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-[#0a0f1e] px-3 py-2 text-sm text-white"
                rows={3}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleEdit}
                  className="rounded px-3 py-1 text-xs font-medium text-[var(--color-accent-400)] hover:bg-gray-800"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded px-3 py-1 text-xs text-gray-500 hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-gray-400">
              {comment.body}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3">
            {user && !isReply && (
              <button
                onClick={() => setReplying(!replying)}
                className="text-xs text-gray-600 hover:text-gray-400"
              >
                Reply
              </button>
            )}
            {user && user.display_name === comment.author && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-gray-600 hover:text-gray-400"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-gray-600 hover:text-red-400"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {replying && (
            <div className="mt-3">
              <CommentForm
                slug={slug}
                parentId={comment.id}
                onSubmitted={() => {
                  setReplying(false);
                  onUpdated();
                }}
                onCancel={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              slug={slug}
              onUpdated={onUpdated}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
