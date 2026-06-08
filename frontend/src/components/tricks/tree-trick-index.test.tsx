import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TreeTrickIndex from "./tree-trick-index";
import type { Phase, TrickInPhase } from "@/lib/types";

function makeTrick(over: Partial<TrickInPhase>): TrickInPhase {
  return {
    id: 1,
    name: "Power Loop",
    slug: "power-loop",
    description: "",
    difficulty: 4,
    prerequisite_ids: [],
    video_count: 0,
    favorite_count: 0,
    demo_gif_url: "",
    is_community: false,
    ...over,
  };
}

function makePhase(over: Partial<Phase>): Phase {
  return {
    id: 1,
    name: "Foundations",
    order: 1,
    description: "",
    tricks: [],
    ...over,
  };
}

describe("TreeTrickIndex", () => {
  it("renders each phase as a heading with crawlable links to its tricks", () => {
    const phases = [
      makePhase({
        id: 1,
        name: "Foundations",
        tricks: [
          makeTrick({ id: 1, name: "Hover", slug: "hover" }),
          makeTrick({ id: 2, name: "Power Loop", slug: "power-loop" }),
        ],
      }),
    ];

    render(<TreeTrickIndex phases={phases} />);

    const heading = screen.getByRole("heading", { name: "Foundations" });
    expect(heading).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Hover" })).toHaveAttribute(
      "href",
      "/tricks/hover",
    );
    expect(screen.getByRole("link", { name: "Power Loop" })).toHaveAttribute(
      "href",
      "/tricks/power-loop",
    );
  });

  it("omits community tricks (they are not part of the official tree)", () => {
    const phases = [
      makePhase({
        tricks: [
          makeTrick({ id: 1, name: "Official", slug: "official" }),
          makeTrick({
            id: 2,
            name: "Community One",
            slug: "community-one",
            is_community: true,
          }),
        ],
      }),
    ];

    render(<TreeTrickIndex phases={phases} />);

    expect(screen.getByRole("link", { name: "Official" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Community One" }),
    ).not.toBeInTheDocument();
  });
});
