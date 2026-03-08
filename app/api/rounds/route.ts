import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { event_id, player_id, scorer_id, handicap } = await request.json();

    if (!event_id || !player_id || !scorer_id || handicap === undefined) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (player_id === scorer_id) {
      return NextResponse.json(
        { error: "Player and scorer must be different" },
        { status: 400 }
      );
    }

    // If round already exists for this player/event, return it
    const { data: existing } = await supabaseServer
      .from("rounds")
      .select("id, status")
      .eq("event_id", event_id)
      .eq("player_id", player_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ...existing, existing: true });
    }

    const { data, error } = await supabaseServer
      .from("rounds")
      .insert({ event_id, player_id, scorer_id, handicap: parseInt(handicap), status: "in_progress" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating round:", error);
    return NextResponse.json({ error: "Failed to create round" }, { status: 500 });
  }
}
