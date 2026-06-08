"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import Button from "@/components/ui/button";

// Auth-gated CTA. Isolated as a small client component so the surrounding
// community page can stay a Server Component (and render its trick list + links
// into the initial HTML for crawlers).
export default function CommunitySubmitButton({
  className,
  children = "Submit a Trick",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <Link href="/community/submit">
      <Button className={className}>{children}</Button>
    </Link>
  );
}
