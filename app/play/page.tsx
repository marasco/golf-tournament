"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { supabaseClient } from "@/lib/supabase/client";
import { useCurrentPlayer } from "@/lib/use-current-player";
import { Event, Player } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface InProgressRound {
  id: string;
  player_name: string;
  event_name: string;
  event_date: string;
  holes_played: number;
}

export default function PlayPage() {
  const router = useRouter();
  const { player: currentPlayer, login, logout, loaded } = useCurrentPlayer();

  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<(Event & { tournament: { name: string } | null })[]>([]);
  const [inProgressRounds, setInProgressRounds] = useState<InProgressRound[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectingPlayer, setSelectingPlayer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [playerId, setPlayerId] = useState("");
  const [eventId, setEventId] = useState("");
  const [handicap, setHandicap] = useState("");

  useEffect(() => {
    if (!loaded) return;
    async function load() {
      const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split("T")[0]; })();
      const nextMonth = (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().split("T")[0]; })();

      const [playersRes, eventsRes] = await Promise.all([
        supabaseClient.from("players").select("*").order("name"),
        supabaseClient
          .from("events")
          .select("*, tournament:tournaments(name)")
          .not("course_id", "is", null)
          .gte("date", yesterday)
          .lte("date", nextMonth)
          .order("date", { ascending: true }),
      ]);

      const playersData = (playersRes.data || []) as Player[];
      setPlayers(playersData);
      setEvents((eventsRes.data || []) as any[]);

      // Only load MY in-progress rounds (where I am the scorer)
      if (currentPlayer) {
        const { data: rounds } = await supabaseClient
          .from("rounds")
          .select("id, player_id, event_id")
          .eq("status", "in_progress")
          .eq("scorer_id", currentPlayer.id)
          .order("created_at", { ascending: false });

        if (rounds && rounds.length > 0) {
          const eventIds = [...new Set(rounds.map((r: any) => r.event_id))];
          const { data: roundEvents } = await supabaseClient
            .from("events")
            .select("id, name, date")
            .in("id", eventIds);

          const roundIds = rounds.map((r: any) => r.id);
          const { data: holeCounts } = await supabaseClient
            .from("hole_scores")
            .select("round_id")
            .in("round_id", roundIds)
            .not("strokes", "is", null);

          const holeCountMap: Record<string, number> = {};
          (holeCounts || []).forEach((hs: any) => {
            holeCountMap[hs.round_id] = (holeCountMap[hs.round_id] || 0) + 1;
          });

          const enriched: InProgressRound[] = rounds.map((r: any) => {
            const player = playersData.find((p) => p.id === r.player_id);
            const event = (roundEvents || []).find((e: any) => e.id === r.event_id);
            const [, month, day] = (event?.date || "").split("-");
            return {
              id: r.id,
              player_name: player?.name || "—",
              event_name: event?.name || "—",
              event_date: event ? `${parseInt(day)}/${parseInt(month)}` : "—",
              holes_played: holeCountMap[r.id] || 0,
            };
          });
          setInProgressRounds(enriched);
        }
      }

      setLoadingData(false);
    }
    load();
  }, [loaded, currentPlayer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || !eventId || !handicap || !currentPlayer) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          player_id: playerId,
          scorer_id: currentPlayer.id,
          handicap: parseInt(handicap),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar el partido");
      router.push(`/rounds/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  // Not loaded from localStorage yet
  if (!loaded || loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg drop-shadow">Cargando...</div>
      </div>
    );
  }

  // Player not identified → show selector
  if (!currentPlayer) {
    return (
      <div className="max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">¿Quién sos?</h1>
          <p className="text-white/80 text-sm mt-1 drop-shadow">
            Seleccioná tu nombre para continuar
          </p>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6 space-y-4">
          <Select value={selectingPlayer} onChange={(e) => setSelectingPlayer(e.target.value)}>
            <option value="">Seleccionar jugador...</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
          <Button
            className="w-full"
            disabled={!selectingPlayer}
            onClick={() => {
              const p = players.find((p) => p.id === selectingPlayer);
              if (p) login({ id: p.id, name: p.name });
            }}
          >
            Continuar →
          </Button>
        </div>
      </div>
    );
  }

  const availablePlayers = players.filter((p) => p.id !== currentPlayer.id);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">Jugar</h1>
        <p className="text-white/80 text-sm mt-1 drop-shadow">
          Cargando como{" "}
          <span className="font-semibold">{currentPlayer.name}</span>
          {" · "}
          <button onClick={logout} className="underline hover:text-white">
            Cambiar
          </button>
        </p>
      </div>

      {/* My in-progress rounds */}
      {inProgressRounds.length > 0 && (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            🟡 Mis rondas en curso
          </h2>
          <div className="divide-y divide-gray-100">
            {inProgressRounds.map((r) => (
              <button
                key={r.id}
                onClick={() => router.push(`/rounds/${r.id}`)}
                className="w-full text-left py-2.5 flex items-center justify-between hover:bg-gray-50 rounded transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900">{r.player_name}</div>
                  <div className="text-xs text-gray-500">
                    {r.event_name} · {r.event_date}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-semibold text-augusta-green">
                    {r.holes_played}/18
                  </div>
                  <div className="text-xs text-gray-400">hoyos</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* New round form */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Iniciar nuevo partido
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jugador</label>
            <Select value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
              <option value="">Seleccionar jugador...</option>
              {availablePlayers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marcador</label>
            <div className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 items-center">
              {currentPlayer.name} <span className="ml-1 text-gray-400">(vos)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha / Jornada</label>
            <Select value={eventId} onChange={(e) => setEventId(e.target.value)}>
              <option value="">Seleccionar fecha...</option>
              {events.map((event) => {
                const [, month, day] = event.date.split("-");
                const tournamentLabel = event.tournament?.name ? ` — ${event.tournament.name}` : "";
                return (
                  <option key={event.id} value={event.id}>
                    {event.name} ({parseInt(day)}/{parseInt(month)}){tournamentLabel}
                  </option>
                );
              })}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Handicap del jugador
            </label>
            <Input
              type="number"
              placeholder="Ej: 10"
              value={handicap}
              onChange={(e) => setHandicap(e.target.value)}
              min="0"
              max="54"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !playerId || !eventId || !handicap}
            className="w-full"
          >
            {submitting ? "Iniciando..." : "Iniciar Partido →"}
          </Button>
        </form>
      </div>
    </div>
  );
}
