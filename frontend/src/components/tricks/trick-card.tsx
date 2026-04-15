import Link from "next/link";
import { DifficultyBadge } from "@/components/ui/badge";

interface TrickCardProps {
  name: string;
  slug: string;
  description: string;
  difficulty: number;
  phaseName: string;
  videoCount: number;
  favoriteCount?: number;
  isLearned?: boolean;
}

export default function TrickCard({
  name,
  slug,
  description,
  difficulty,
  phaseName,
  videoCount,
  favoriteCount = 0,
  isLearned = false,
}: TrickCardProps) {
  return (
    <Link href={`/tricks/${slug}`}>
      <div
        className={`group relative rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 ${
          isLearned
            ? "border-[var(--color-accent-500)]/30 bg-[#111827]"
            : "border-gray-800 bg-[#111827]"
        }`}
      >
        {isLearned && (
          <div className="absolute left-0 right-0 top-0 h-0.5 rounded-t-xl bg-[var(--color-accent-500)]" />
        )}
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white group-hover:text-[var(--color-accent-400)]">
            {name}
          </h3>
          {isLearned && (
            <span className="text-xs text-[var(--color-accent-400)]">&#10003;</span>
          )}
        </div>
        <p className="mb-3 text-xs leading-relaxed text-gray-500">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={difficulty} />
            <span className="text-[10px] text-gray-600">{phaseName}</span>
          </div>
          <div className="flex items-center gap-3">
            {favoriteCount > 0 && (
              <div
                className="flex items-center gap-1 text-[10px] text-gray-600"
                title={`${favoriteCount} saved this trick`}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{favoriteCount}</span>
              </div>
            )}
            {videoCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="flex h-3.5 w-4 items-center justify-center rounded-sm bg-red-600 text-[7px] font-bold text-white">
                  &#9654;
                </span>
                <span className="text-[10px] text-gray-600">
                  {videoCount} video{videoCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
