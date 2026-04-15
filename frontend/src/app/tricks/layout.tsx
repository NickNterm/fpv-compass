import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FPV Tricks List — Searchable Index of Freestyle Maneuvers",
  description:
    "Every FPV freestyle trick in one searchable list, sorted by difficulty and filterable by phase. Each trick links to the best community tutorial videos.",
  alternates: { canonical: "/tricks" },
  openGraph: {
    title: "FPV Tricks List — Searchable Index of Freestyle Maneuvers",
    description:
      "Every FPV freestyle trick in one searchable list, sorted by difficulty. Each trick links to the best community tutorial videos.",
    url: "/tricks",
    type: "website",
  },
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.fpv-compass.xyz";

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    {
      "@type": "ListItem",
      position: 2,
      name: "Tricks",
      item: `${SITE_URL}/tricks`,
    },
  ],
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "FPV Tricks List",
  url: `${SITE_URL}/tricks`,
  description:
    "Complete searchable list of FPV freestyle tricks, sorted by difficulty, with community tutorial videos.",
  about: { "@type": "Thing", name: "FPV freestyle drone flying" },
};

export default function TricksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {children}
    </>
  );
}
