import { NextRequest, NextResponse } from "next/server";

// Canonical host derived from the configured site URL (build-time public var,
// falls back to the production domain).
const CANONICAL_HOST = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.fpv-compass.xyz",
    ).host;
  } catch {
    return "www.fpv-compass.xyz";
  }
})();

// Hosts that must never be redirected: local dev, container healthchecks, and
// internal docker networking. Compared against the hostname only (port stripped).
const ALLOWED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "nextjs",
  "django",
]);

// Redirect any non-canonical public host (the apex domain, the
// fpv-compass.pamelesxi.gr VPS subdomain, etc.) to the canonical host with a
// permanent 301. This collapses duplicate-content hosts into one URL so Google
// never indexes anything but www.fpv-compass.xyz.
export function middleware(req: NextRequest): NextResponse {
  const host = req.headers.get("host");
  if (!host) return NextResponse.next();

  const hostname = host.split(":")[0];

  if (host === CANONICAL_HOST || ALLOWED_HOSTNAMES.has(hostname)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.protocol = "https:";
  url.hostname = CANONICAL_HOST;
  url.port = "";
  return NextResponse.redirect(url, 301);
}

export const config = {
  // Run on everything except the API proxy and Next internals/static assets.
  // robots.txt and sitemap.xml are intentionally included so they also redirect
  // on a non-canonical host.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
