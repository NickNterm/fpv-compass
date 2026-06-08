import { fetchTricksServer } from "@/lib/server-api";
import TricksBrowser from "@/components/tricks/tricks-browser";

// Render per-request so the trick list always reflects live data and is never
// served as a build-time empty prerender (the backend is unreachable at build).
// The underlying fetch is still cached for 1h via next.revalidate.
export const dynamic = "force-dynamic";

// Server Component: fetches the full trick list on the server so the cards and
// their /tricks/[slug] links are present in the initial HTML (indexable +
// crawlable). Interactivity lives in the client TricksBrowser child.
export default async function TricksListPage() {
  const tricks = await fetchTricksServer();
  return <TricksBrowser initialTricks={tricks} />;
}
