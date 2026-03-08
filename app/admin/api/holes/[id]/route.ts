import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { par } = await request.json();

    if (!par || par < 3 || par > 5) {
      return NextResponse.json({ error: "Par must be 3, 4 or 5" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("holes")
      .update({ par })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating hole:", error);
    return NextResponse.json({ error: "Failed to update hole" }, { status: 500 });
  }
}
