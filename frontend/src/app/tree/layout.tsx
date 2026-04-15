import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FPV Skill Tree — Every Freestyle Trick in the Right Order",
  description:
    "Visual progression graph of FPV freestyle tricks, grouped by phase and connected by prerequisites. See exactly what to learn next.",
  alternates: { canonical: "/tree" },
  openGraph: {
    title: "FPV Skill Tree — Every Freestyle Trick in the Right Order",
    description:
      "Visual progression graph of FPV freestyle tricks, grouped by phase and connected by prerequisites.",
    url: "/tree",
    type: "website",
  },
};

export default function TreeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
