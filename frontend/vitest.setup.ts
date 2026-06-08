import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

// next/link renders an <a> in the browser; stub it to a plain anchor so
// presentational components can be tested without the App Router context.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href, ...rest }, children),
}));
