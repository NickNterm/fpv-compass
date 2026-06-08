"use client";

export default function VoteControl({
  voteCount,
  userVote,
  onVote,
  disabled,
}: {
  voteCount: number;
  userVote: number | null;
  onVote: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onVote(1);
        }}
        aria-label="Upvote"
        className={`text-lg leading-none transition-colors disabled:cursor-not-allowed ${
          userVote === 1
            ? "text-[var(--color-accent-400)]"
            : "text-gray-600 hover:text-gray-400"
        }`}
      >
        &#9650;
      </button>
      <span className="text-xs font-bold text-white">{voteCount}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onVote(-1);
        }}
        aria-label="Downvote"
        className={`text-lg leading-none transition-colors disabled:cursor-not-allowed ${
          userVote === -1
            ? "text-red-400"
            : "text-gray-600 hover:text-gray-400"
        }`}
      >
        &#9660;
      </button>
    </div>
  );
}
