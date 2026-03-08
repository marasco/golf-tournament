import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: round } = await supabaseServer
      .from("rounds")
      .select("status")
      .eq("id", id)
      .single();

    if (!round) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (round.status === "completed") {
      return NextResponse.json({ error: "Cannot delete a completed round" }, { status: 400 });
    }

    const { error } = await supabaseServer.from("rounds").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting round:", error);
    return NextResponse.json({ error: "Failed to delete round" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: round, error: roundError } = await supabaseServer
      .from("rounds")
      .select("id, handicap, status, event_id, player_id, scorer_id")
      .eq("id", id)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const [playerRes, scorerRes, eventRes] = await Promise.all([
      supabaseServer.from("players").select("name").eq("id", round.player_id).single(),
      supabaseServer.from("players").select("name").eq("id", round.scorer_id).single(),
      supabaseServer.from("events").select("id, name, date, tournament_id, course_id").eq("id", round.event_id).single(),
    ]);

    const courseId = eventRes.data?.course_id;

    const [holesRes, scoresRes, mirrorRoundRes] = await Promise.all([
      courseId
        ? supabaseServer.from("holes").select("id, hole_number, par").eq("course_id", courseId).order("hole_number")
        : Promise.resolve({ data: [], error: null }),
      supabaseServer.from("hole_scores").select("hole_number, strokes, scorer_strokes").eq("round_id", id),
      // Mirror round: same event, where the scorer of this round is the player
      supabaseServer
        .from("rounds")
        .select("id")
        .eq("event_id", round.event_id)
        .eq("player_id", round.scorer_id)
        .maybeSingle(),
    ]);

    // Fetch mirror hole scores if mirror round exists
    let mirrorHoleScores: { hole_number: number; strokes: number | null }[] = [];
    if (mirrorRoundRes.data?.id) {
      const { data: mirrorScores } = await supabaseServer
        .from("hole_scores")
        .select("hole_number, strokes")
        .eq("round_id", mirrorRoundRes.data.id)
        .not("strokes", "is", null);
      mirrorHoleScores = mirrorScores || [];
    }

    return NextResponse.json({
      ...round,
      player: playerRes.data ?? { name: "—" },
      scorer: scorerRes.data ?? { name: "—" },
      event: eventRes.data,
      holes: holesRes.data || [],
      hole_scores: scoresRes.data || [],
      mirror_hole_scores: mirrorHoleScores,
    });
  } catch (error) {
    console.error("[rounds/GET] Exception:", error);
    return NextResponse.json({ error: "Failed to fetch round" }, { status: 500 });
  }
}
