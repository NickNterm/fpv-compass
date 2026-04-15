"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { PaginatedResponse, TrickListItem, UserProgress } from "@/lib/types";
import TrickCard from "@/components/tricks/trick-card";

export default function TricksListPage() {
  const { user } = useAuth();
  const [tricks, setTricks] = useState<TrickListItem[]>([]);
  const [learnedSlugs, setLearnedSlugs] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<PaginatedResponse<TrickListItem>>(
          `/tricks/?is_community=false&search=${encodeURIComponent(search)}`
        );
        setTricks(data.results);

        if (user) {
          const progress = await apiGet<UserProgress[]>("/progress/");
          setLearnedSlugs(new Set(progress.map((p) => p.trick_slug)));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, user]);

  const phases = [...new Set(tricks.map((t) => t.phase_name))];

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

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-800/50" />
          ))}
        </div>
      ) : (
        phases.map((phaseName) => (
          <div key={phaseName} className="mb-8">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-600">
              {phaseName}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tricks
                .filter((t) => t.phase_name === phaseName)
                .map((trick) => (
                  <TrickCard
                    key={trick.id}
                    name={trick.name}
                    slug={trick.slug}
                    description={trick.description}
                    difficulty={trick.difficulty}
                    phaseName={trick.phase_name}
                    videoCount={trick.video_count}
                    favoriteCount={trick.favorite_count}
                    isLearned={learnedSlugs.has(trick.slug)}
                  />
                ))}
            </div>
          </div>
        ))
      )}

      {!loading && tricks.length === 0 && (
        <p className="text-center text-gray-600">
          No tricks found. {search ? "Try a different search." : ""}
        </p>
      )}
    </div>
  );
}
