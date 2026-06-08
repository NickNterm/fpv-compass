import { fetchPhasesServer } from "@/lib/server-api";
import TreeView from "./tree-view";
import TreeTrickIndex from "@/components/tricks/tree-trick-index";

// Render per-request so the tree + crawlable index always reflect live data and
// are never served as a build-time empty prerender (backend is unreachable at
// build). The underlying fetch is still cached for 1h via next.revalidate.
export const dynamic = "force-dynamic";

// Server Component: fetches phases on the server so the interactive tree is
// seeded with data (no empty first paint) and a crawlable phase→trick index is
// rendered into the initial HTML for indexing and internal linking.
export default async function TreePage() {
  const phases = await fetchPhasesServer();
  return (
    <div className="min-h-screen">
      <TreeView initialPhases={phases} />
      <div className="mx-auto max-w-5xl px-6 pb-16">
        <TreeTrickIndex phases={phases} />
      </div>
    </div>
  );
}
