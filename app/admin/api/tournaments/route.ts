import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, description, year, is_active } = await request.json();

    if (!name || !name.trim() || !year) {
      return NextResponse.json(
        { error: "Name and year are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("tournaments")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        year: parseInt(year),
        is_active: is_active ?? false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating tournament:", error);
    return NextResponse.json(
      { error: "Failed to create tournament" },
      { status: 500 }
    );
  }
}
