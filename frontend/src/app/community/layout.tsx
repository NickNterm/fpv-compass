import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Tricks — Pilot-Submitted FPV Maneuvers",
  description:
    "FPV tricks submitted by the community. Vote, discuss, and help promote the best ones into the official skill tree.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Community Tricks — Pilot-Submitted FPV Maneuvers",
    description:
      "FPV tricks submitted by the community. Vote, discuss, and help promote the best ones into the official skill tree.",
    url: "/community",
    type: "website",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
