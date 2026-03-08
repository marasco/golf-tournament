import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: round_id } = await params;
    const { hole_number, strokes, scorer_strokes } = await request.json();

    const { data, error } = await supabaseServer
      .from("hole_scores")
      .upsert(
        {
          round_id,
          hole_number,
          strokes: strokes && strokes > 0 ? strokes : null,
          scorer_strokes: scorer_strokes && scorer_strokes > 0 ? scorer_strokes : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "round_id,hole_number" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error saving hole score:", error);
    return NextResponse.json({ error: "Failed to save hole score" }, { status: 500 });
  }
}
