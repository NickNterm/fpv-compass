"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { Favorite, TrickDetail, UserProgress } from "@/lib/types";
import { DifficultyBadge } from "@/components/ui/badge";
import Badge from "@/components/ui/badge";
import { VideoEmbed, DemoGif } from "@/components/tricks/video-player";
import ProgressButton from "@/components/tricks/progress-button";
import FavoriteButton from "@/components/tricks/favorite-button";
import CommentSection from "@/components/comments/comment-section";
import Modal from "@/components/ui/modal";

export default function TrickDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isLoading: authLoading } = useAuth();
  const [trick, setTrick] = useState<TrickDetail | null>(null);
  const [isLearned, setIsLearned] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    // Wait for auth to resolve before fetching — otherwise progress/favorites
    // are skipped and the button briefly paints the wrong state.
    if (authLoading) return;

    async function load() {
      try {
        const requests: Promise<unknown>[] = [
          apiGet<TrickDetail>(`/tricks/${slug}/`),
        ];
        if (user) {
          requests.push(
            apiGet<UserProgress[]>("/progress/"),
            apiGet<Favorite[]>("/favorites/")
          );
        }
        const results = await Promise.all(requests);
        setTrick(results[0] as TrickDetail);
        if (user) {
          const progress = results[1] as UserProgress[];
          const favorites = results[2] as Favorite[];
          setIsLearned(progress.some((p) => p.trick_slug === slug));
          setIsFavorited(favorites.some((f) => f.trick_slug === slug));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, user, authLoading]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-800/50" />
        <div className="mt-4 h-4 w-96 animate-pulse rounded bg-gray-800/50" />
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-gray-800/50" />
      </div>
    );
  }

  if (!trick) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Trick not found</h1>
        <p className="mt-2 text-gray-500">
          <Link href="/tricks" className="text-[var(--color-accent-400)] hover:underline">
            Browse all tricks
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Back to tree */}
      <Link
        href="/tree"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[var(--color-accent-400)]"
      >
        <span aria-hidden>←</span> Back to skill tree
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Badge variant="orange">{trick.phase_name}</Badge>
          <DifficultyBadge difficulty={trick.difficulty} />
          {trick.is_community && <Badge variant="default">Community</Badge>}
        </div>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-white">{trick.name}</h1>
          <div className="flex items-center gap-2">
            <FavoriteButton
              slug={slug}
              initialFavorited={isFavorited}
              initialCount={trick.favorite_count}
            />
            <ProgressButton
              slug={slug}
              initialLearned={isLearned}
              onToggle={(learned) => {
                if (learned) setShowReturnModal(true);
              }}
            />
          </div>
        </div>
        <p className="mt-2 text-gray-400">{trick.description}</p>
      </div>

      {/* Pro Tip */}
      {trick.pro_tip && (
        <div className="mb-8 rounded-lg border border-orange-500/15 bg-orange-500/5 p-4">
          <p className="mb-1 text-[10px] font-bold text-orange-400">PRO TIP</p>
          <p className="text-sm leading-relaxed text-orange-300/80">
            {trick.pro_tip}
          </p>
        </div>
      )}

      {/* Prerequisites */}
      {trick.prerequisites.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-600">
            Prerequisites
          </h2>
          <div className="flex flex-wrap gap-2">
            {trick.prerequisites.map((prereq) => (
              <Link
                key={prereq.id}
                href={`/tricks/${prereq.slug}`}
                className="rounded-full border border-[var(--color-accent-800)]/30 bg-[var(--color-accent-900)]/30 px-3 py-1 text-xs font-medium text-[var(--color-accent-400)] hover:bg-[var(--color-accent-900)]/50"
              >
                {prereq.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {trick.videos.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-600">
            Videos ({trick.videos.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {trick.videos.map((video) => (
              <VideoEmbed key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}

      {/* Demo GIF — shown when no videos, or as supplementary demo */}
      {trick.demo_gif_url && (
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-600">
            {trick.videos.length > 0 ? "Demo" : "Demo Preview"}
          </h2>
          <div className="max-w-md">
            <DemoGif url={trick.demo_gif_url} trickName={trick.name} />
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="border-t border-gray-800 pt-8">
        <CommentSection slug={slug} />
      </div>

      <Modal
        open={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        title="Nice — trick learned!"
        description="Want to head back to the skill tree and pick your next move?"
        confirmLabel="Back to tree"
        cancelLabel="Stay here"
        onConfirm={() => {
          router.refresh();
          router.push("/tree");
        }}
      />
    </div>
  );
}
