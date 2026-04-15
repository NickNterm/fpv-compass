import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ideas & Roadmap — FPV Compass",
  description:
    "Upcoming features, bug reports, and community ideas for FPV Compass. Vote on what should ship next.",
  alternates: { canonical: "/ideas" },
  openGraph: {
    title: "Ideas & Roadmap — FPV Compass",
    description:
      "Upcoming features, bug reports, and community ideas for FPV Compass.",
    url: "/ideas",
    type: "website",
  },
};

export default function IdeasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
