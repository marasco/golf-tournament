import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[rounds/GET] id:", id);

    const { data: round, error: roundError } = await supabaseServer
      .from("rounds")
      .select("id, handicap, status, event_id, player_id, scorer_id")
      .eq("id", id)
      .single();

    console.log("[rounds/GET] round:", round, "error:", roundError);
    if (roundError || !round) {
      return NextResponse.json({ error: "Round not found", detail: roundError }, { status: 404 });
    }

    const [playerRes, scorerRes, eventRes] = await Promise.all([
      supabaseServer.from("players").select("name").eq("id", round.player_id).single(),
      supabaseServer.from("players").select("name").eq("id", round.scorer_id).single(),
      supabaseServer.from("events").select("id, name, date, tournament_id, course_id").eq("id", round.event_id).single(),
    ]);

    console.log("[rounds/GET] event:", eventRes.data, "error:", eventRes.error);
    const courseId = eventRes.data?.course_id;
    console.log("[rounds/GET] courseId:", courseId);

    const [holesRes, scoresRes] = await Promise.all([
      courseId
        ? supabaseServer.from("holes").select("id, hole_number, par").eq("course_id", courseId).order("hole_number")
        : Promise.resolve({ data: [], error: null }),
      supabaseServer.from("hole_scores").select("hole_number, strokes, scorer_strokes").eq("round_id", id),
    ]);

    console.log("[rounds/GET] holes count:", holesRes.data?.length, "error:", (holesRes as any).error);
    console.log("[rounds/GET] hole_scores count:", scoresRes.data?.length, "error:", scoresRes.error);
    console.log("[rounds/GET] hole_scores data:", JSON.stringify(scoresRes.data));

    return NextResponse.json({
      ...round,
      player: playerRes.data ?? { name: "—" },
      scorer: scorerRes.data ?? { name: "—" },
      event: eventRes.data,
      holes: holesRes.data || [],
      hole_scores: scoresRes.data || [],
    });
  } catch (error) {
    console.error("[rounds/GET] Exception:", error);
    return NextResponse.json({ error: "Failed to fetch round" }, { status: 500 });
  }
}
