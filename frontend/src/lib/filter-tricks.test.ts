import { describe, it, expect } from "vitest";
import { filterTricks } from "./filter-tricks";
import type { TrickListItem } from "@/lib/types";

function makeTrick(over: Partial<TrickListItem>): TrickListItem {
  return {
    id: 1,
    name: "Power Loop",
    slug: "power-loop",
    description: "A vertical loop.",
    difficulty: 4,
    phase_id: 1,
    phase_name: "Basic Tricks",
    prerequisite_ids: [],
    tags: [],
    video_count: 0,
    favorite_count: 0,
    demo_gif_url: "",
    is_community: false,
    ...over,
  };
}

describe("filterTricks", () => {
  const tricks = [
    makeTrick({ id: 1, name: "Power Loop", description: "Vertical loop" }),
    makeTrick({ id: 2, name: "Split-S", description: "Half roll then dive" }),
    makeTrick({ id: 3, name: "Matty Flip", description: "Inverted yaw spin" }),
  ];

  it("returns all tricks for an empty query", () => {
    expect(filterTricks(tricks, "")).toHaveLength(3);
    expect(filterTricks(tricks, "   ")).toHaveLength(3);
  });

  it("matches on name, case-insensitively", () => {
    const result = filterTricks(tricks, "split");
    expect(result.map((t) => t.id)).toEqual([2]);
  });

  it("matches on description", () => {
    const result = filterTricks(tricks, "inverted");
    expect(result.map((t) => t.id)).toEqual([3]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterTricks(tricks, "zzz")).toEqual([]);
  });
});
