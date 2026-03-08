import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: round, error: roundError } = await supabaseServer
      .from("rounds")
      .select("*")
      .eq("id", id)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }
    if (round.status === "completed") {
      return NextResponse.json({ error: "Round already completed" }, { status: 400 });
    }

    const { data: holeScores } = await supabaseServer
      .from("hole_scores")
      .select("strokes")
      .eq("round_id", id)
      .not("strokes", "is", null);

    const grossScore = (holeScores || []).reduce(
      (sum, hs) => sum + (hs.strokes || 0),
      0
    );

    if (grossScore === 0) {
      return NextResponse.json({ error: "No hay scores cargados" }, { status: 400 });
    }

    const { error: scoreError } = await supabaseServer.from("scores").upsert(
      {
        player_id: round.player_id,
        event_id: round.event_id,
        handicap: round.handicap,
        gross_score: grossScore,
      },
      { onConflict: "player_id,event_id" }
    );
    if (scoreError) throw scoreError;

    const { error: updateError } = await supabaseServer
      .from("rounds")
      .update({ status: "completed" })
      .eq("id", id);
    if (updateError) throw updateError;

    return NextResponse.json({ success: true, gross_score: grossScore });
  } catch (error) {
    console.error("Error completing round:", error);
    return NextResponse.json({ error: "Failed to complete round" }, { status: 500 });
  }
}
