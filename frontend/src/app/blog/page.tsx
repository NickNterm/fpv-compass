import { fetchPostsServer } from "@/lib/server-api";
import BlogBoard from "./blog-board";

// Render per-request and seed the board with server-fetched posts so the page
// is not a blank client shell on first paint / for crawlers. Interactivity
// (voting, sorting) stays in the client BlogBoard.
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await fetchPostsServer("votes");
  return <BlogBoard initialPosts={posts} />;
}
