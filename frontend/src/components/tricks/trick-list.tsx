import type { TrickListItem } from "@/lib/types";
import TrickCard from "@/components/tricks/trick-card";

interface TrickListProps {
  tricks: TrickListItem[];
  learnedSlugs?: Set<string>;
}

// Presentational, server-renderable list of tricks grouped by phase. Emitting
// the cards (and their /tricks/[slug] links) in the server HTML is what makes
// the page indexable and restores the internal link graph for crawlers.
export default function TrickList({
  tricks,
  learnedSlugs,
}: TrickListProps) {
  const phases = [...new Set(tricks.map((t) => t.phase_name))];

  return (
    <>
      {phases.map((phaseName) => (
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
                  isLearned={learnedSlugs?.has(trick.slug) ?? false}
                />
              ))}
          </div>
        </div>
      ))}
    </>
  );
}
