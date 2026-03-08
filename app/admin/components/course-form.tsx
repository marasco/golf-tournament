"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Course, Hole } from "@/lib/types";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";

interface CourseWithHoles extends Course {
  holes: Hole[];
}

interface CourseFormProps {
  courses: CourseWithHoles[];
}

export function CourseForm({ courses: initialCourses }: CourseFormProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [savingHole, setSavingHole] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/admin/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create course");
      const newCourse = await res.json();

      // Add default holes
      const holes = Array.from({ length: 18 }, (_, i) => ({
        id: "",
        course_id: newCourse.id,
        hole_number: i + 1,
        par: 4,
      }));
      setCourses([...courses, { ...newCourse, holes }]);
      setName("");
    } catch (err) {
      setError("Error al crear la cancha");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta cancha? Se eliminarán todos sus hoyos.")) return;
    try {
      const res = await fetch(`/admin/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCourses(courses.filter((c) => c.id !== id));
    } catch {
      setError("Error al eliminar la cancha");
    }
  };

  const handleParChange = async (courseId: string, hole: Hole, newPar: number) => {
    if (newPar < 3 || newPar > 5 || !hole.id) return;
    setSavingHole(hole.id);
    try {
      const res = await fetch(`/admin/api/holes/${hole.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ par: newPar }),
      });
      if (!res.ok) throw new Error();
      setCourses(
        courses.map((c) =>
          c.id === courseId
            ? {
                ...c,
                holes: c.holes.map((h) =>
                  h.id === hole.id ? { ...h, par: newPar } : h
                ),
              }
            : c
        )
      );
    } catch {
      setError("Error al guardar el par");
    } finally {
      setSavingHole(null);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-3">
        <Input
          type="text"
          placeholder="Nombre de la cancha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Agregando..." : "Agregar"}
        </Button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="rounded-lg border divide-y">
        {courses.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No hay canchas. Agrega una arriba.
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id}>
              <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <button
                  onClick={() =>
                    setExpandedCourse(expandedCourse === course.id ? null : course.id)
                  }
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <span className="font-medium">{course.name}</span>
                  <span className="text-xs text-gray-400">
                    Par{" "}
                    {course.holes.reduce((s, h) => s + h.par, 0)} —{" "}
                    {course.holes.length} hoyos
                  </span>
                  {expandedCourse === course.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 ml-auto" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="ml-3 text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {expandedCourse === course.id && (
                <div className="bg-gray-50 px-4 py-3 border-t">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs text-gray-500 font-medium mb-2">
                    <span>Hoyo</span>
                    <span className="text-center">Par actual</span>
                    <span className="text-center">Cambiar par</span>
                  </div>
                  {course.holes
                    .sort((a, b) => a.hole_number - b.hole_number)
                    .map((hole) => (
                      <div
                        key={hole.hole_number}
                        className="grid grid-cols-3 gap-x-4 items-center py-1 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          Hoyo {hole.hole_number}
                        </span>
                        <span className="text-sm text-center font-bold text-augusta-green">
                          {hole.par}
                        </span>
                        <div className="flex gap-1 justify-center">
                          {[3, 4, 5].map((p) => (
                            <button
                              key={p}
                              disabled={savingHole === hole.id || hole.par === p}
                              onClick={() => handleParChange(course.id, hole, p)}
                              className={`w-8 h-7 text-xs rounded font-medium transition-colors ${
                                hole.par === p
                                  ? "bg-augusta-green text-white"
                                  : "bg-white border border-gray-200 text-gray-600 hover:border-augusta-green hover:text-augusta-green"
                              } disabled:opacity-40`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  <div className="mt-2 pt-2 border-t text-xs text-gray-500 text-right">
                    Total par: <strong>{course.holes.reduce((s, h) => s + h.par, 0)}</strong>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
