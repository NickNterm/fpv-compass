import type {
  TrickListItem,
  PaginatedResponse,
  Phase,
  Idea,
} from "@/lib/types";

// Server-side data access. Runs in Server Components against the internal Django
// host so the trick list is rendered into the initial HTML (indexable + linked).
const INTERNAL_API = process.env.INTERNAL_API_URL || "http://django:8000";

// Cap server-side fetches so a slow/stuck backend can't hang page rendering.
const FETCH_TIMEOUT_MS = 5000;

async function fetchTricksPage(
  isCommunity: boolean,
): Promise<TrickListItem[]> {
  const all: TrickListItem[] = [];
  let url: string | null = `${INTERNAL_API}/api/tricks/?is_community=${isCommunity}&page_size=100`;

  try {
    while (url) {
      const res: Response = await fetch(url, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) break;
      const data = (await res.json()) as PaginatedResponse<TrickListItem>;
      if (Array.isArray(data.results)) all.push(...data.results);

      // Rewrite the absolute "next" link back onto the internal host.
      if (data.next) {
        try {
          const u = new URL(data.next);
          url = `${INTERNAL_API}${u.pathname}${u.search}`;
        } catch {
          url = null;
        }
      } else {
        url = null;
      }
    }
  } catch {
    // Return whatever was collected; the page still renders.
  }

  return all;
}

export function fetchTricksServer(): Promise<TrickListItem[]> {
  return fetchTricksPage(false);
}

export function fetchCommunityTricksServer(): Promise<TrickListItem[]> {
  return fetchTricksPage(true);
}

export async function fetchIdeasServer(
  sort: "votes" | "newest" = "votes",
): Promise<Idea[]> {
  try {
    const res = await fetch(`${INTERNAL_API}/api/ideas/?sort=${sort}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Idea[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchPhasesServer(): Promise<Phase[]> {
  try {
    const res = await fetch(`${INTERNAL_API}/api/phases/`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Phase[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
