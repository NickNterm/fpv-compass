"use client";

import { FormEvent, useState } from "react";
import { apiPost } from "@/lib/api";
import Button from "@/components/ui/button";

interface CommentFormProps {
  slug: string;
  parentId?: number;
  onSubmitted: () => void;
  onCancel?: () => void;
}

export default function CommentForm({
  slug,
  parentId,
  onSubmitted,
  onCancel,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      await apiPost(`/tricks/${slug}/comments/create/`, {
        body: body.trim(),
        parent: parentId ?? null,
      });
      setBody("");
      onSubmitted();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "Add a comment..."}
        className="w-full rounded-lg border border-gray-700 bg-[#0a0f1e] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)]"
        rows={parentId ? 2 : 3}
      />
      <div className="mt-2 flex gap-2">
        <Button type="submit" size="sm" disabled={loading || !body.trim()}>
          {loading ? "Posting..." : parentId ? "Reply" : "Comment"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
