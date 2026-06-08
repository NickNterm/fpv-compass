import { fetchIdeasServer } from "@/lib/server-api";
import IdeasBoard from "./ideas-board";

// Render per-request and seed the board with server-fetched ideas so the page
// is not a blank client shell on first paint / for crawlers. Interactivity
// (voting, sorting, comments, submission) stays in the client IdeasBoard.
export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const ideas = await fetchIdeasServer("votes");
  return <IdeasBoard initialIdeas={ideas} />;
}
