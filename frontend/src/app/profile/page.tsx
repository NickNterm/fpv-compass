"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { Phase, UserProgress } from "@/lib/types";

const NEXT_SUGGESTIONS_LIMIT = 5;
const RECENT_WINDOW_DAYS = 7;

interface PhaseProgress {
  id: number;
  name: string;
  total: number;
  completed: number;
  percent: number;
}

interface NextSuggestion {
  id: number;
  name: string;
  slug: string;
  difficulty: number;
  phase_name: string;
}

function buildPhaseProgress(
  phases: Phase[],
  learnedIds: Set<number>
): PhaseProgress[] {
  return phases
    .filter((p) => p.tricks.some((t) => !t.is_community))
    .map((p) => {
      const official = p.tricks.filter((t) => !t.is_community);
      const completed = official.filter((t) => learnedIds.has(t.id)).length;
      const total = official.length;
      return {
        id: p.id,
        name: p.name,
        total,
        completed,
        percent: total === 0 ? 0 : Math.round((completed / total) * 100),
      };
    });
}

function buildNextSuggestions(
  phases: Phase[],
  learnedIds: Set<number>
): NextSuggestion[] {
  const unlocked: NextSuggestion[] = [];
  for (const phase of phases) {
    for (const trick of phase.tricks) {
      if (trick.is_community) continue;
      if (learnedIds.has(trick.id)) continue;
      const allPrereqsMet = trick.prerequisite_ids.every((pid) =>
        learnedIds.has(pid)
      );
      if (!allPrereqsMet) continue;
      unlocked.push({
        id: trick.id,
        name: trick.name,
        slug: trick.slug,
        difficulty: trick.difficulty,
        phase_name: phase.name,
      });
    }
  }
  unlocked.sort((a, b) => a.difficulty - b.difficulty);
  return unlocked.slice(0, NEXT_SUGGESTIONS_LIMIT);
}

function countRecent(progress: UserProgress[], days: number): number {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return progress.filter((p) => new Date(p.learned_at).getTime() >= cutoff)
    .length;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      Promise.all([
        apiGet<UserProgress[]>("/progress/"),
        apiGet<Phase[]>("/phases/"),
      ])
        .then(([p, ph]) => {
          setProgress(p);
          setPhases(ph);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, router]);

  const learnedIds = useMemo(() => {
    const ids = new Set<number>();
    const slugToId = new Map<string, number>();
    for (const phase of phases) {
      for (const trick of phase.tricks) {
        slugToId.set(trick.slug, trick.id);
      }
    }
    for (const p of progress) {
      const id = slugToId.get(p.trick_slug);
      if (id !== undefined) ids.add(id);
    }
    return ids;
  }, [phases, progress]);

  const phaseProgress = useMemo(
    () => buildPhaseProgress(phases, learnedIds),
    [phases, learnedIds]
  );

  const nextSuggestions = useMemo(
    () => buildNextSuggestions(phases, learnedIds),
    [phases, learnedIds]
  );

  const recentCount = useMemo(
    () => countRecent(progress, RECENT_WINDOW_DAYS),
    [progress]
  );

  const totalOfficialTricks = useMemo(
    () =>
      phases.reduce(
        (acc, p) => acc + p.tricks.filter((t) => !t.is_community).length,
        0
      ),
    [phases]
  );

  if (authLoading || !user) return null;

  const overallPercent =
    totalOfficialTricks === 0
      ? 0
      : Math.round((learnedIds.size / totalOfficialTricks) * 100);

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

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard
          value={learnedIds.size}
          label={`of ${totalOfficialTricks} tricks`}
        />
        <StatCard value={`${overallPercent}%`} label="overall" />
        <StatCard
          value={recentCount}
          label={`in last ${RECENT_WINDOW_DAYS} days`}
        />
      </div>

      {/* Next to learn */}
      <section className="mb-8 rounded-xl border border-gray-800 bg-[#111827] p-6">
        <h2 className="mb-1 text-sm font-semibold text-white">
          Next to Learn
        </h2>
        <p className="mb-4 text-xs text-gray-500">
          Tricks whose prerequisites you&apos;ve already completed.
        </p>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-gray-800/50"
              />
            ))}
          </div>
        ) : nextSuggestions.length === 0 ? (
          <p className="text-sm text-gray-500">
            {learnedIds.size === 0
              ? "Start with the Foundations phase to unlock suggestions."
              : "You've unlocked everything available — nice work!"}
          </p>
        ) : (
          <div className="space-y-2">
            {nextSuggestions.map((s) => (
              <Link
                key={s.id}
                href={`/tricks/${s.slug}`}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-[#0a0f1e] px-4 py-3 transition-colors hover:border-[var(--color-accent-500)]/60"
              >
                <div>
                  <p className="text-sm font-medium text-white">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.phase_name}</p>
                </div>
                <span className="rounded-md bg-gray-800/80 px-2 py-0.5 text-xs font-semibold text-gray-300">
                  D{s.difficulty}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Phase progress */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-600">
          Progress by Phase
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-gray-800/50"
              />
            ))}
          </div>
        ) : phaseProgress.length === 0 ? (
          <p className="text-sm text-gray-500">No phases available.</p>
        ) : (
          <div className="space-y-2">
            {phaseProgress.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-gray-800 bg-[#111827] px-4 py-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {p.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {p.completed}/{p.total}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent-500)] transition-all"
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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

function StatCard({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#111827] p-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-gray-500">{label}</p>
    </div>
  );
}
