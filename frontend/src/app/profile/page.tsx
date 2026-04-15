"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { UserProgress } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      apiGet<UserProgress[]>("/progress/")
        .then(setProgress)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* User info */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-accent-500)] text-lg font-bold text-white">
          {user.display_name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{user.display_name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Progress summary */}
      <div className="mb-8 rounded-xl border border-gray-800 bg-[#111827] p-6">
        <h2 className="mb-3 text-sm font-semibold text-white">
          Trick Progress
        </h2>
        <p className="text-3xl font-bold text-white">
          {progress.length}{" "}
          <span className="text-lg font-normal text-gray-500">
            trick{progress.length !== 1 ? "s" : ""} learned
          </span>
        </p>
      </div>

      {/* Learned tricks list */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-600">
        Completed Tricks
      </h2>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-800/50" />
          ))}
        </div>
      ) : progress.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-[#111827] p-8 text-center">
          <p className="text-gray-500">No tricks learned yet.</p>
          <Link
            href="/tree"
            className="mt-2 inline-block text-sm text-[var(--color-accent-400)] hover:underline"
          >
            Check out the skill tree
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {progress.map((p) => (
            <Link
              key={p.id}
              href={`/tricks/${p.trick_slug}`}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-[#111827] px-4 py-3 transition-colors hover:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-accent-400)]">&#10003;</span>
                <span className="text-sm font-medium text-white">
                  {p.trick_name}
                </span>
              </div>
              <span className="text-xs text-gray-600">
                {new Date(p.learned_at).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
