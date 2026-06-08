"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { filterTricks } from "@/lib/filter-tricks";
import TrickList from "@/components/tricks/trick-list";
import type { TrickListItem, UserProgress } from "@/lib/types";

interface TricksBrowserProps {
  initialTricks: TrickListItem[];
}

// Interactive shell around the server-rendered TrickList. Receives the full
// list from the server (so the initial HTML already contains every trick + its
// link), then filters client-side and overlays per-user "learned" state.
export default function TricksBrowser({ initialTricks }: TricksBrowserProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [learnedSlugs, setLearnedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setLearnedSlugs(new Set());
      return;
    }
    let active = true;
    async function loadProgress() {
      try {
        const progress = await apiGet<UserProgress[]>("/progress/");
        if (active) setLearnedSlugs(new Set(progress.map((p) => p.trick_slug)));
      } catch {
        // non-critical: checkmarks just won't show
      }
    }
    loadProgress();
    return () => {
      active = false;
    };
  }, [user]);

  const visible = useMemo(
    () => filterTricks(initialTricks, search),
    [initialTricks, search],
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-white">All Tricks</h1>
      <p className="mb-8 text-sm text-gray-500">
        Sorted by difficulty. Search or filter by phase.
      </p>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tricks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-700 bg-[#111827] px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)]"
        />
      </div>

      <TrickList tricks={visible} learnedSlugs={learnedSlugs} />

      {visible.length === 0 && (
        <p className="text-center text-gray-600">
          No tricks found. {search ? "Try a different search." : ""}
        </p>
      )}
    </div>
  );
}
