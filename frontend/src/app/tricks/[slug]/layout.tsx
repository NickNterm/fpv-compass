import type { Metadata } from "next";
import { notFound } from "next/navigation";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.fpv-compass.xyz";
const INTERNAL_API =
  process.env.INTERNAL_API_URL || "http://django:8000";

interface TrickVideo {
  id: number;
  youtube_url: string;
  title: string;
  channel_name: string;
  duration_seconds: number;
}

interface TrickDetail {
  slug: string;
  name: string;
  description?: string;
  pro_tip?: string;
  difficulty?: number;
  phase_name?: string;
  videos?: TrickVideo[];
  demo_gif_url?: string;
  updated_at?: string;
  created_at?: string;
}

async function fetchTrick(slug: string): Promise<TrickDetail | null> {
  try {
    const res = await fetch(`${INTERNAL_API}/api/tricks/${slug}/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as TrickDetail;
  } catch {
    return null;
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1) || null;
    }
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
    }
    return null;
  } catch {
    return null;
  }
}

function isoDurationFromSeconds(seconds: number): string | null {
  // Schema.org duration must be a positive value. Return null when unknown so
  // the caller can omit the property entirely (omitting is valid; "PT0S" is not).
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  let out = "PT";
  if (h) out += `${h}H`;
  if (m) out += `${m}M`;
  if (s || (!h && !m)) out += `${s}S`;
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trick = await fetchTrick(slug);

  if (!trick) {
    return {
      title: "Trick not found — FPV Compass",
      description: "This FPV trick could not be found.",
      alternates: { canonical: `/tricks/${slug}` },
    };
  }

  const title = `${trick.name} — FPV Freestyle Trick Tutorial`;
  const rawDescription =
    trick.description ||
    `Learn the ${trick.name} FPV freestyle trick with community tutorial videos and tips.`;
  const description = truncate(rawDescription, 155);
  const path = `/tricks/${trick.slug}`;

  const firstVideoThumb = trick.videos
    ?.map((v) => extractYoutubeId(v.youtube_url))
    .find((id): id is string => Boolean(id));
  const ogImage = firstVideoThumb
    ? `https://i.ytimg.com/vi/${firstVideoThumb}/hqdefault.jpg`
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: "article",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function buildJsonLd(trick: TrickDetail): Record<string, unknown>[] {
  const path = `/tricks/${trick.slug}`;
  const pageUrl = `${SITE_URL}${path}`;

  const breadcrumb = {
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
      { "@type": "ListItem", position: 3, name: trick.name, item: pageUrl },
    ],
  };

  const videos: Record<string, unknown>[] = (trick.videos ?? [])
    .map((v): Record<string, unknown> | null => {
      const id = extractYoutubeId(v.youtube_url);
      if (!id) return null;
      const node: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: v.title || trick.name,
        description:
          v.title ||
          `${trick.name} tutorial by ${v.channel_name} on YouTube.`,
        thumbnailUrl: [
          `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        ],
        uploadDate:
          trick.created_at ||
          trick.updated_at ||
          new Date().toISOString().split("T")[0],
        embedUrl: `https://www.youtube.com/embed/${id}`,
        contentUrl: v.youtube_url,
        isPartOf: { "@type": "WebPage", "@id": pageUrl },
      };
      const duration = isoDurationFromSeconds(v.duration_seconds);
      if (duration) {
        node.duration = duration;
      }
      if (v.channel_name) {
        node.author = { "@type": "Person", name: v.channel_name };
      }
      return node;
    })
    .filter((x): x is Record<string, unknown> => x !== null);

  const learning = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: trick.name,
    url: pageUrl,
    description:
      trick.description ||
      `${trick.name} — an FPV freestyle trick with tutorial videos.`,
    learningResourceType: "Tutorial",
    educationalLevel: trick.phase_name,
    about: {
      "@type": "Thing",
      name: "FPV freestyle drone flying",
    },
    keywords: [
      "FPV",
      "freestyle",
      "drone tricks",
      trick.name,
      trick.phase_name,
    ].filter(Boolean),
  };

  return [breadcrumb, learning, ...videos];
}

export default async function TrickLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trick = await fetchTrick(slug);
  if (!trick) {
    notFound();
  }
  const jsonLd = buildJsonLd(trick);

  return (
    <>
      {jsonLd.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
      {children}
    </>
  );
}
