"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Event, Player, ScoreWithDetails } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface ScoreFormProps {
  players: Player[];
  events: Event[];
  scores: ScoreWithDetails[];
}

export function ScoreForm({
  players,
  events,
  scores: initialScores,
}: ScoreFormProps) {
  const [scores, setScores] = useState(initialScores);
  const [playerId, setPlayerId] = useState("");
  const [eventId, setEventId] = useState("");
  const [handicap, setHandicap] = useState("");
  const [grossScore, setGrossScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || !eventId || !handicap || !grossScore) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/admin/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: playerId,
          event_id: eventId,
          handicap: parseInt(handicap),
          gross_score: parseInt(grossScore),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create score");
      }

      const newScore = await response.json();
      const player = players.find((p) => p.id === playerId);
      const event = events.find((e) => e.id === eventId);

      if (player && event) {
        setScores([
          ...scores,
          { ...newScore, player, event },
        ]);
      }

      setPlayerId("");
      setEventId("");
      setHandicap("");
      setGrossScore("");
    } catch (err: any) {
      setError(err.message || "Failed to create score");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this score?")) return;

    try {
      const response = await fetch(`/admin/api/scores/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete score");

      setScores(scores.filter((s) => s.id !== id));
    } catch (err) {
      setError("Failed to delete score");
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            <option value="">Select Player</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </Select>

          <Select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">Select Event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} ({event.date.split("-").reverse().slice(0, 2).join("/")})
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Handicap"
            value={handicap}
            onChange={(e) => setHandicap(e.target.value)}
            min="0"
            max="54"
          />
          <Input
            type="number"
            placeholder="Gross Score"
            value={grossScore}
            onChange={(e) => setGrossScore(e.target.value)}
            min="1"
            max="200"
          />
        </div>

        <Button
          type="submit"
          disabled={
            loading || !playerId || !eventId || !handicap || !grossScore
          }
        >
          {loading ? "Adding..." : "Add Score"}
        </Button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border divide-y">
        {scores.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No scores yet. Add one above.
          </div>
        ) : (
          scores.map((score) => {
            const net = score.gross_score - score.handicap;
            return (
              <div
                key={score.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium">{score.player.name}</div>
                  <div className="text-sm text-gray-600">
                    {score.event.name} • Gross: {score.gross_score} • Handicap:{" "}
                    {score.handicap} • Net: {net}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(score.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Delete score"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
