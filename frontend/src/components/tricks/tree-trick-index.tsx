import Link from "next/link";
import type { Phase } from "@/lib/types";

interface TreeTrickIndexProps {
  phases: Phase[];
}

// Server-rendered, crawlable index of every official trick grouped by phase.
// Rendered into the /tree page so the page has indexable text content and the
// internal link graph reaches all trick pages even though the visual tree is
// an interactive client component.
export default function TreeTrickIndex({ phases }: TreeTrickIndexProps) {
  return (
    <nav aria-label="All tricks by phase" className="mt-12 border-t border-gray-800/50 pt-8">
      <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-600">
        All tricks by phase
      </h2>
      <div className="space-y-6">
        {phases.map((phase) => {
          const officialTricks = phase.tricks.filter((t) => !t.is_community);
          if (officialTricks.length === 0) return null;
          return (
            <div key={phase.id}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {phase.name}
              </h3>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {officialTricks.map((trick) => (
                  <li key={trick.id}>
                    <Link
                      href={`/tricks/${trick.slug}`}
                      className="text-sm text-gray-400 hover:text-[var(--color-accent-400)]"
                    >
                      {trick.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
