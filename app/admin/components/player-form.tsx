"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseServer } from "@/lib/supabase/server";
import { Player } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface PlayerFormProps {
  players: Player[];
}

export function PlayerForm({ players: initialPlayers }: PlayerFormProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/admin/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) throw new Error("Failed to create player");

      const newPlayer = await response.json();
      setPlayers([...players, newPlayer]);
      setName("");
    } catch (err) {
      setError("Failed to create player");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this player? This will also delete all their scores."))
      return;

    try {
      const response = await fetch(`/admin/api/players/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete player");

      setPlayers(players.filter((p) => p.id !== id));
    } catch (err) {
      setError("Failed to delete player");
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Adding..." : "Add Player"}
        </Button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border divide-y">
        {players.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No players yet. Add one above.
          </div>
        ) : (
          players.map((player) => (
            <div
              key={player.id}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">{player.name}</span>
              <button
                onClick={() => handleDelete(player.id)}
                className="text-red-600 hover:text-red-700 p-1"
                title="Delete player"
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
