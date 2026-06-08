import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — FPV Compass",
  description:
    "Stories, guides, and hot takes from the FPV freestyle community. Read, post, and vote on what the community is talking about.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — FPV Compass",
    description:
      "Stories, guides, and hot takes from the FPV freestyle community.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
