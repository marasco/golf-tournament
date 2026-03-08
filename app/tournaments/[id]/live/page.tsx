"use client";

import { useCurrentPlayer } from "@/lib/use-current-player";
import { supabaseClient } from "@/lib/supabase/client";
import { use, useEffect, useRef, useState } from "react";

interface LiveRow {
  roundId: string;
  playerId: string;
  scorerId: string;
  playerName: string;
  handicap: number;
  holesPlayed: number;
  strokesVsPar: number;
  projectedNet: number;
  status: "in_progress" | "completed";
}

function formatVsPar(n: number) {
  if (n > 0) return `+${n}`;
  if (n === 0) return "E";
  return `${n}`;
}

export default function LiveLeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tournamentId } = use(params);
  const [rows, setRows] = useState<LiveRow[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const { player: currentPlayer } = useCurrentPlayer();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [tournamentRes, eventsRes] = await Promise.all([
        supabaseClient
          .from("tournaments")
          .select("name")
          .eq("id", tournamentId)
          .single(),
        supabaseClient
          .from("events")
          .select("id, date, course_id")
          .eq("tournament_id", tournamentId),
      ]);

      if (!mountedRef.current) return;
      if (tournamentRes.data) setTournamentName(tournamentRes.data.name);

      const events = eventsRes.data || [];
      if (events.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      const eventIds = events.map((e: any) => e.id);
      const courseIds = [
        ...new Set(events.map((e: any) => e.course_id).filter(Boolean)),
      ] as string[];

      const [roundsRes, holesRes] = await Promise.all([
        supabaseClient
          .from("rounds")
          .select(
            "id, player_id, scorer_id, event_id, handicap, status, player:players!player_id(name)",
          )
          .in("event_id", eventIds),
        courseIds.length > 0
          ? supabaseClient
              .from("holes")
              .select("course_id, hole_number, par")
              .in("course_id", courseIds)
          : Promise.resolve({ data: [] }),
      ]);

      if (!mountedRef.current) return;

      const rounds = roundsRes.data || [];
      const holes = (holesRes as any).data || [];

      if (rounds.length === 0) {
        setRows([]);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

      const roundIds = rounds.map((r: any) => r.id);
      const { data: holeScores } = await supabaseClient
        .from("hole_scores")
        .select("round_id, hole_number, strokes")
        .in("round_id", roundIds)
        .not("strokes", "is", null);

      if (!mountedRef.current) return;

      const liveRows: LiveRow[] = rounds.map((round: any) => {
        const event = events.find((e: any) => e.id === round.event_id);
        const courseHoles = holes.filter(
          (h: any) => h.course_id === event?.course_id,
        );
        const roundScores = (holeScores || []).filter(
          (hs: any) => hs.round_id === round.id,
        );

        const holesPlayed = roundScores.length;
        const strokesVsPar = roundScores.reduce((sum: number, hs: any) => {
          const hole = courseHoles.find(
            (h: any) => h.hole_number === hs.hole_number,
          );
          return sum + (hs.strokes - (hole?.par ?? 4));
        }, 0);
        const projectedNet = strokesVsPar - round.handicap;

        return {
          roundId: round.id,
          playerId: round.player_id,
          scorerId: round.scorer_id,
          playerName: round.player?.name || "—",
          handicap: round.handicap,
          holesPlayed,
          strokesVsPar,
          projectedNet,
          status: round.status,
        };
      });

      // Sort: players with 0 holes to the bottom, rest by projectedNet asc
      liveRows.sort((a, b) => {
        if (a.holesPlayed === 0 && b.holesPlayed === 0) return 0;
        if (a.holesPlayed === 0) return 1;
        if (b.holesPlayed === 0) return -1;
        return a.projectedNet - b.projectedNet;
      });

      setRows(liveRows);
      setLastUpdated(new Date());
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [tournamentId, refreshTick]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg drop-shadow">Cargando...</div>
      </div>
    );
  }

  const inProgress = rows.filter((r) => r.status === "in_progress");
  const completed = rows.filter((r) => r.status === "completed");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">
          Tablero en Vivo
        </h1>
        <p className="text-white/80 text-sm drop-shadow">{tournamentName}</p>
        {lastUpdated && (
          <p className="text-white/50 text-xs mt-1">
            Actualizado: {lastUpdated.toLocaleTimeString("es-AR")} ·
            auto-refresh 30s
          </p>
        )}
        <button
          onClick={() => setRefreshTick((t) => t + 1)}
          className="mt-2 text-white/70 hover:text-white text-xs underline"
        >
          Actualizar ahora
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow p-8 text-center text-gray-500">
          <p>No hay rondas en curso todavía.</p>
          <a
            href="/play"
            className="text-augusta-green hover:underline text-sm mt-2 block"
          >
            Iniciar un partido →
          </a>
        </div>
      ) : (
        <>
          {inProgress.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wide">
                En juego ({inProgress.length})
              </h2>
              <LiveTable
                rows={inProgress}
                currentPlayerId={currentPlayer?.id}
              />
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wide">
                Finalizados ({completed.length})
              </h2>
              <LiveTable rows={completed} currentPlayerId={currentPlayer?.id} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LiveTable({
  rows,
  currentPlayerId,
}: {
  rows: LiveRow[];
  currentPlayerId: string | undefined;
}) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-augusta-green text-white text-xs">
          <tr>
            <th className="px-3 py-2 text-left">Pos</th>
            <th className="px-3 py-2 text-left">Jugador</th>
            <th className="px-2 py-2 text-center">Hcp</th>
            <th className="px-2 py-2 text-center">Hoyo</th>
            <th className="px-2 py-2 text-center">Score</th>
            <th className="px-2 py-2 text-center font-bold">Neto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, idx) => {
            const hasPlayed = row.holesPlayed > 0;
            const isMyRound =
              currentPlayerId && row.scorerId === currentPlayerId;
            return (
              <tr
                key={row.roundId}
                className={idx < 3 && hasPlayed ? "bg-augusta-gold/10" : ""}
              >
                <td className="px-3 py-3 font-medium text-gray-700">
                  {hasPlayed ? (
                    <>
                      {idx === 0 && "🏆 "}
                      {idx + 1}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-3 font-medium text-gray-900">
                  {isMyRound ? (
                    <a
                      href={`/rounds/${row.roundId}`}
                      className="text-augusta-green underline"
                    >
                      {row.playerName}
                    </a>
                  ) : (
                    row.playerName
                  )}
                </td>
                <td className="px-2 py-3 text-center text-gray-500">
                  {row.handicap}
                </td>
                <td className="px-2 py-3 text-center text-gray-600">
                  {hasPlayed ? row.holesPlayed : "—"}
                </td>
                <td
                  className={`px-2 py-3 text-center font-semibold ${
                    !hasPlayed
                      ? "text-gray-300"
                      : row.strokesVsPar < 0
                        ? "text-augusta-green"
                        : row.strokesVsPar === 0
                          ? "text-gray-600"
                          : "text-red-500"
                  }`}
                >
                  {hasPlayed ? formatVsPar(row.strokesVsPar) : "—"}
                </td>
                <td
                  className={`px-2 py-3 text-center font-bold ${
                    !hasPlayed
                      ? "text-gray-300"
                      : row.projectedNet < 0
                        ? "text-augusta-green"
                        : row.projectedNet === 0
                          ? "text-gray-600"
                          : "text-red-500"
                  }`}
                >
                  {hasPlayed ? formatVsPar(row.projectedNet) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
