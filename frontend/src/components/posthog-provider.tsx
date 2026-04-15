"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog, { initPostHog } from "@/lib/posthog";

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initPostHog();
  }, []);

  // Track page views on route change
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = searchParams?.toString()
        ? `${pathname}?${searchParams}`
        : pathname;
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
