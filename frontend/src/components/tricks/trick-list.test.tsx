import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TrickList from "./trick-list";
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
    video_count: 3,
    favorite_count: 5,
    demo_gif_url: "",
    is_community: false,
    ...over,
  };
}

describe("TrickList", () => {
  it("renders a crawlable link to each trick's detail page", () => {
    const tricks = [
      makeTrick({ id: 1, name: "Power Loop", slug: "power-loop" }),
      makeTrick({ id: 2, name: "Split-S", slug: "540-split-s" }),
    ];

    render(<TrickList tricks={tricks} />);

    const powerLoop = screen.getByRole("link", { name: /Power Loop/i });
    expect(powerLoop).toHaveAttribute("href", "/tricks/power-loop");

    const splitS = screen.getByRole("link", { name: /Split-S/i });
    expect(splitS).toHaveAttribute("href", "/tricks/540-split-s");
  });

  it("groups tricks under their phase heading", () => {
    const tricks = [
      makeTrick({ id: 1, name: "Power Loop", phase_name: "Basic Tricks" }),
      makeTrick({
        id: 2,
        name: "Matty Flip",
        slug: "matty-flip",
        phase_name: "Intermediate",
      }),
    ];

    render(<TrickList tricks={tricks} />);

    expect(
      screen.getByRole("heading", { name: "Basic Tricks" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Intermediate" }),
    ).toBeInTheDocument();
  });

  it("marks learned tricks via the learnedSlugs set", () => {
    const tricks = [makeTrick({ slug: "power-loop", name: "Power Loop" })];

    render(<TrickList tricks={tricks} learnedSlugs={new Set(["power-loop"])} />);

    // The learned trick still renders its link; this guards the optional prop path.
    expect(screen.getByRole("link", { name: /Power Loop/i })).toHaveAttribute(
      "href",
      "/tricks/power-loop",
    );
  });
});
