import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create course
    const { data: course, error: courseError } = await supabaseServer
      .from("courses")
      .insert({ name: name.trim() })
      .select()
      .single();
    if (courseError) throw courseError;

    // Create 18 holes with default par 4
    const holes = Array.from({ length: 18 }, (_, i) => ({
      course_id: course.id,
      hole_number: i + 1,
      par: 4,
    }));
    const { error: holesError } = await supabaseServer.from("holes").insert(holes);
    if (holesError) throw holesError;

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
