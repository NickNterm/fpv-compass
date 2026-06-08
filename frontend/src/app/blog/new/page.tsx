"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { PostDetail } from "@/lib/types";
import MarkdownBody from "@/components/blog/markdown-body";

export default function NewPostPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const post = await apiPost<PostDetail>("/blog/posts/create/", {
        title,
        body,
      });
      router.push(`/blog/${post.id}`);
    } catch {
      setError("Could not publish your post. Please try again.");
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="h-40 animate-pulse rounded-xl bg-[#111827]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-sm text-gray-400">
          You need to be logged in to write a post.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-[var(--color-accent-500)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-600)]"
          >
            Log in
          </Link>
          <Link
            href="/blog"
            className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/blog"
        className="mb-6 inline-block text-xs text-gray-500 hover:text-gray-300"
      >
        &larr; Back to Blog
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-white">New Post</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A catchy title for your post..."
            maxLength={200}
            required
            className="w-full rounded-lg border border-gray-700 bg-[#0a0f1e] px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-accent-500)] focus:outline-none"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-400">
              Body{" "}
              <span className="text-gray-600">(Markdown supported)</span>
            </label>
            <div className="flex rounded-lg border border-gray-800 bg-[#111827] p-0.5">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={`rounded-md px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                  tab === "write"
                    ? "bg-gray-700 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`rounded-md px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                  tab === "preview"
                    ? "bg-gray-700 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {tab === "write" ? (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                "Write your post here.\n\n## Use headings\n\n- bullet lists\n- **bold**, *italic*, `code`\n\n> and quotes"
              }
              rows={14}
              required
              className="w-full rounded-lg border border-gray-700 bg-[#0a0f1e] px-3 py-2 font-mono text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-accent-500)] focus:outline-none"
            />
          ) : (
            <div className="min-h-[20rem] rounded-lg border border-gray-700 bg-[#0a0f1e] px-4 py-3">
              {body.trim() ? (
                <MarkdownBody>{body}</MarkdownBody>
              ) : (
                <p className="text-xs text-gray-600">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || !title.trim() || !body.trim()}
            className="rounded-lg bg-[var(--color-accent-500)] px-5 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-600)] disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish Post"}
          </button>
          <Link
            href="/blog"
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
