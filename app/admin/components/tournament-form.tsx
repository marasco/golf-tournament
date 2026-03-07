"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tournament } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface TournamentFormProps {
  tournaments: Tournament[];
}

export function TournamentForm({ tournaments: initialTournaments }: TournamentFormProps) {
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !year) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/admin/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          year: parseInt(year),
          is_active: isActive,
        }),
      });

      if (!response.ok) throw new Error("Failed to create tournament");

      const newTournament = await response.json();
      setTournaments([...tournaments, newTournament]);
      setName("");
      setDescription("");
      setYear(new Date().getFullYear().toString());
      setIsActive(false);
    } catch (err) {
      setError("Failed to create tournament");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este torneo? Los eventos quedarán sin torneo asignado.")) return;

    try {
      const response = await fetch(`/admin/api/tournaments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete tournament");

      setTournaments(tournaments.filter((t) => t.id !== id));
    } catch (err) {
      setError("Failed to delete tournament");
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            type="text"
            placeholder="Nombre del torneo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Año"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <Input
          type="text"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded"
          />
          Torneo activo
        </label>
        <Button type="submit" disabled={loading || !name.trim() || !year}>
          {loading ? "Agregando..." : "Agregar Torneo"}
        </Button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border divide-y">
        {tournaments.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No hay torneos todavía. Agrega uno arriba.
          </div>
        ) : (
          tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{tournament.name}</div>
                <div className="text-sm text-gray-600">
                  {tournament.year}
                  {tournament.description && ` • ${tournament.description}`}
                  {tournament.is_active && (
                    <span className="ml-2 text-xs bg-augusta-green text-white px-2 py-0.5 rounded-full">
                      Activo
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(tournament.id)}
                className="text-red-600 hover:text-red-700 p-1"
                title="Eliminar torneo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
