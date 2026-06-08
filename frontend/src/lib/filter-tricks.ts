import type { TrickListItem } from "@/lib/types";

// Client-side filtering of an already-loaded trick list. The full list is
// rendered server-side for SEO; this just narrows it as the user types, with no
// extra API round-trips.
export function filterTricks(
  tricks: TrickListItem[],
  query: string,
): TrickListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return tricks;
  return tricks.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q),
  );
}
