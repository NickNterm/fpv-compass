import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.fpv-compass.xyz";
const INTERNAL_API =
  process.env.INTERNAL_API_URL || "http://django:8000";

interface TrickSlug {
  slug: string;
  updated_at?: string;
}

async function fetchTrickSlugs(): Promise<TrickSlug[]> {
  const all: TrickSlug[] = [];
  let url: string | null = `${INTERNAL_API}/api/tricks/?is_community=false&page_size=100`;
  try {
    while (url) {
      const res: Response = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) break;
      const data = (await res.json()) as {
        results?: Array<{ slug?: string; updated_at?: string }>;
        next?: string | null;
      };
      const list = Array.isArray(data.results) ? data.results : [];
      for (const t of list) {
        if (typeof t.slug === "string") {
          all.push({ slug: t.slug, updated_at: t.updated_at });
        }
      }
      url = data.next ?? null;
      if (url && url.startsWith("http://django")) url = url;
      else if (url) {
        try {
          const u = new URL(url);
          url = `${INTERNAL_API}${u.pathname}${u.search}`;
        } catch {
          url = null;
        }
      }
    }
  } catch {
    // fall through with whatever we've got
  }
  return all;
}

function isoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = isoDate(new Date());
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/tree`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/tricks`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/community`, lastModified: today, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/ideas`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: today, changeFrequency: "monthly", priority: 0.7 },
  ];

  const tricks = await fetchTrickSlugs();
  const trickRoutes: MetadataRoute.Sitemap = tricks.map((t) => ({
    url: `${SITE_URL}/tricks/${t.slug}`,
    lastModified: t.updated_at ? isoDate(new Date(t.updated_at)) : today,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...trickRoutes];
}
