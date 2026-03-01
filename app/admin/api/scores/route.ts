import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { player_id, event_id, handicap, gross_score } = await request.json();

    if (!player_id || !event_id || handicap === undefined || gross_score === undefined) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if score already exists for this player/event combination
    const { data: existing } = await supabaseServer
      .from("scores")
      .select("id")
      .eq("player_id", player_id)
      .eq("event_id", event_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Score already exists for this player and event" },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseServer
      .from("scores")
      .insert({
        player_id,
        event_id,
        handicap: parseInt(handicap),
        gross_score: parseInt(gross_score),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating score:", error);
    return NextResponse.json(
      { error: "Failed to create score" },
      { status: 500 }
    );
  }
}
