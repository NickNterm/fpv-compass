"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { Phase } from "@/lib/types";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function SubmitTrickPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState(5);
  const [phaseId, setPhaseId] = useState<number | "">("");
  const [proTip, setProTip] = useState("");
  const [videoUrls, setVideoUrls] = useState([""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<Phase[]>("/phases/").then(setPhases).catch(() => {});
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  function addVideoField() {
    setVideoUrls([...videoUrls, ""]);
  }

  function updateVideoUrl(index: number, value: string) {
    const updated = [...videoUrls];
    updated[index] = value;
    setVideoUrls(updated);
  }

  function removeVideoUrl(index: number) {
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const filteredUrls = videoUrls.filter((u) => u.trim());
    if (filteredUrls.length === 0) {
      setError("At least one video URL is required.");
      setLoading(false);
      return;
    }

    try {
      await apiPost("/community/submit/", {
        name,
        description,
        difficulty,
        phase_id: phaseId,
        pro_tip: proTip,
        video_urls: filteredUrls,
      });
      router.push("/community");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-white">Submit a Trick</h1>
      <p className="mb-8 text-sm text-gray-500">
        Share a trick with the community. The best submissions get promoted to the official tree.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Trick Name"
          placeholder="e.g. Inverted Yaw Spin"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this trick? How does it look?"
            className="w-full rounded-xl border border-gray-700 bg-[#111827] px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)]"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Difficulty (1-10)
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-1 text-center text-sm font-bold text-white">
              {difficulty}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Phase
            </label>
            <select
              value={phaseId}
              onChange={(e) => setPhaseId(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-700 bg-[#111827] px-4 py-3 text-sm text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)]"
              required
            >
              <option value="">Select...</option>
              {phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Pro Tip (optional)
          </label>
          <textarea
            value={proTip}
            onChange={(e) => setProTip(e.target.value)}
            placeholder="Any tips for learning this trick?"
            className="w-full rounded-xl border border-gray-700 bg-[#111827] px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)]"
            rows={2}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            YouTube Video URLs
          </label>
          {videoUrls.map((url, i) => (
            <div key={i} className="mb-2 flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateVideoUrl(i, e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 rounded-xl border border-gray-700 bg-[#111827] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)]"
              />
              {videoUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVideoUrl(i)}
                  className="px-2 text-gray-500 hover:text-red-400"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addVideoField}
            className="text-xs text-[var(--color-accent-400)] hover:underline"
          >
            + Add another video
          </button>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit Trick"}
        </Button>
      </form>
    </div>
  );
}
