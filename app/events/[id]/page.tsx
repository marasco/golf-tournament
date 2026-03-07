import { LeaderboardTable } from "@/components/leaderboard-table";
import { supabaseClient } from "@/lib/supabase/client";
import { Event, LeaderboardPlayer, Player, Score } from "@/lib/types";
import Link from "next/link";

async function getEventData(id: string) {
  const [eventRes, playersRes, scoresRes] = await Promise.all([
    supabaseClient.from("events").select("*").eq("id", id).single(),
    supabaseClient.from("players").select("*").order("name"),
    supabaseClient.from("scores").select("*").eq("event_id", id),
  ]);

  const event = eventRes.data as Event | null;
  const players = (playersRes.data || []) as Player[];
  const scores = (scoresRes.data || []) as Score[];

  if (!event) return { event: null, players: [], events: [] };

  const leaderboardPlayers: LeaderboardPlayer[] = players.map((player) => {
    const score = scores.find((s) => s.player_id === player.id);
    if (!score) {
      return { player, events: {}, totalGross: 0, totalNet: 0, position: 0 };
    }
    const net = score.gross_score - score.handicap;
    return {
      player,
      events: {
        [event.id]: { gross: score.gross_score, net, handicap: score.handicap },
      },
      totalGross: score.gross_score,
      totalNet: net,
      position: 0,
    };
  });

  return { event, players: leaderboardPlayers, events: [event] };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { event, players, events } = await getEventData(id);

  if (!event) {
    return (
      <div className="text-white text-center py-12">Evento no encontrado.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
          {event.name}
        </h1>
        <p className="text-white text-lg drop-shadow">
          {event.course_name} •{" "}
          {new Date(event.date + "T00:00:00").toLocaleDateString("es-AR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </p>
        {event.tournament_id && (
          <Link
            href={`/tournaments/${event.tournament_id}`}
            className="text-white/80 text-sm hover:text-white underline mt-1 inline-block"
          >
            ← Ver torneo completo
          </Link>
        )}
      </div>

      <LeaderboardTable players={players} events={events} />

      <div className="text-center text-sm text-white drop-shadow">
        <p>Score Neto = Score Bruto - Handicap</p>
        <p>Menor puntaje gana</p>
      </div>
    </div>
  );
}
