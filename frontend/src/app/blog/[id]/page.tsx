import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchPostServer } from "@/lib/server-api";
import PostView from "./post-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPostServer(id);
  if (!post) return { title: "Post not found — FPV Compass" };

  const snippet = post.body.replace(/\s+/g, " ").trim().slice(0, 155);
  return {
    title: `${post.title} — FPV Compass Blog`,
    description: snippet,
    alternates: { canonical: `/blog/${id}` },
    openGraph: {
      title: post.title,
      description: snippet,
      url: `/blog/${id}`,
      type: "article",
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPostServer(id);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/blog"
        className="mb-6 inline-block text-xs text-gray-500 hover:text-gray-300"
      >
        &larr; Back to Blog
      </Link>
      <PostView post={post} />
    </div>
  );
}
