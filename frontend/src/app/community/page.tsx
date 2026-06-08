import { fetchCommunityTricksServer } from "@/lib/server-api";
import TrickCard from "@/components/tricks/trick-card";
import CommunitySubmitButton from "@/components/community/submit-button";

// Render per-request so the community trick list (and its /tricks/[slug] links)
// is present in the initial HTML for crawlers, not fetched client-side.
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const tricks = await fetchCommunityTricksServer();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">Community Tricks</h1>
          <p className="text-sm text-gray-500">
            Tricks submitted by the community. The best ones get promoted to the official tree.
          </p>
        </div>
        <CommunitySubmitButton />
      </div>

      {tricks.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-[#111827] p-12 text-center">
          <p className="text-gray-500">No community tricks yet.</p>
          <CommunitySubmitButton className="mt-4">
            Be the first to submit!
          </CommunitySubmitButton>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tricks.map((trick) => (
            <TrickCard
              key={trick.id}
              name={trick.name}
              slug={trick.slug}
              description={trick.description}
              difficulty={trick.difficulty}
              phaseName={trick.phase_name}
              videoCount={trick.video_count}
            />
          ))}
        </div>
      )}
    </div>
  );
}
