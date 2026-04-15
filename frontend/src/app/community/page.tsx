"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { PaginatedResponse, TrickListItem } from "@/lib/types";
import TrickCard from "@/components/tricks/trick-card";
import Button from "@/components/ui/button";

export default function CommunityPage() {
  const { user } = useAuth();
  const [tricks, setTricks] = useState<TrickListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<PaginatedResponse<TrickListItem>>(
          "/tricks/?is_community=true"
        );
        setTricks(data.results);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">Community Tricks</h1>
          <p className="text-sm text-gray-500">
            Tricks submitted by the community. The best ones get promoted to the official tree.
          </p>
        </div>
        {user && (
          <Link href="/community/submit">
            <Button>Submit a Trick</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-800/50" />
          ))}
        </div>
      ) : tricks.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-[#111827] p-12 text-center">
          <p className="text-gray-500">No community tricks yet.</p>
          {user && (
            <Link href="/community/submit">
              <Button className="mt-4">Be the first to submit!</Button>
            </Link>
          )}
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
