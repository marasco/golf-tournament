import { LeaderboardTable } from "@/components/leaderboard-table";
import { supabaseClient } from "@/lib/supabase/client";
import { Event, LeaderboardPlayer, Player, Score, Tournament } from "@/lib/types";
import { EventsDropdown } from "./events-dropdown";

async function getTournamentData(id: string) {
  const [tournamentRes, eventsRes] = await Promise.all([
    supabaseClient.from("tournaments").select("*").eq("id", id).single(),
    supabaseClient.from("events").select("*").eq("tournament_id", id).order("date"),
  ]);

  const tournament = tournamentRes.data as Tournament | null;
  const events = (eventsRes.data || []) as Event[];

  if (!tournament) return { tournament: null, players: [], events: [] };

  const eventIds = events.map((e) => e.id);

  const [playersRes, scoresRes] = await Promise.all([
    supabaseClient.from("players").select("*").order("name"),
    eventIds.length > 0
      ? supabaseClient.from("scores").select("*").in("event_id", eventIds)
      : Promise.resolve({ data: [] }),
  ]);

  const players = (playersRes.data || []) as Player[];
  const scores = (scoresRes.data || []) as Score[];

  const leaderboardPlayers: LeaderboardPlayer[] = players
    .map((player) => {
      const playerScores = scores.filter((s) => s.player_id === player.id);
      const eventScores: LeaderboardPlayer["events"] = {};
      let totalGross = 0;
      let totalNet = 0;

      playerScores.forEach((score) => {
        const net = score.gross_score - score.handicap;
        eventScores[score.event_id] = {
          gross: score.gross_score,
          net,
          handicap: score.handicap,
        };
        totalGross += score.gross_score;
        totalNet += net;
      });

      return { player, events: eventScores, totalGross, totalNet, position: 0 };
    });

  return { tournament, players: leaderboardPlayers, events };
}

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { tournament, players, events } = await getTournamentData(id);

  if (!tournament) {
    return (
      <div className="text-white text-center py-12">Torneo no encontrado.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
          {tournament.name}
        </h1>
        {tournament.description && (
          <p className="text-white text-lg drop-shadow">{tournament.description}</p>
        )}
      </div>

      <EventsDropdown events={events} />

      <LeaderboardTable players={players} events={events} />

      <div className="text-center text-sm text-white drop-shadow">
        <p>Score Neto = Score Bruto - Handicap</p>
        <p>Menor puntaje gana</p>
      </div>
    </div>
  );
}
