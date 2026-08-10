// Docker's HEALTHCHECK target. Deliberately does not touch Supabase — a
// brief DB blip shouldn't make Docker think the container itself is down.
export function GET() {
  return Response.json({ status: "ok" });
}
