interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "orange" | "gray";
  className?: string;
}

const variants = {
  default: "bg-gray-800/60 text-gray-400 border-gray-700/40",
  accent: "bg-[var(--color-accent-900)]/40 text-[var(--color-accent-400)] border-[var(--color-accent-800)]/50",
  orange: "bg-orange-900/40 text-orange-400 border-orange-800/40",
  gray: "bg-gray-800/40 text-gray-500 border-gray-700/30",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: number }) {
  const color =
    difficulty <= 3
      ? "text-green-400"
      : difficulty <= 6
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <span className={`text-xs font-bold ${color}`}>
      Lvl {difficulty}
    </span>
  );
}
