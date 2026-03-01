import { LeaderboardTable } from "@/components/leaderboard-table";
import { supabaseClient } from "@/lib/supabase/client";
import { Event, LeaderboardPlayer, Player, Score } from "@/lib/types";

async function getLeaderboardData() {
  // Fetch all data
  const [playersRes, eventsRes, scoresRes] = await Promise.all([
    supabaseClient.from("players").select("*").order("name"),
    supabaseClient.from("events").select("*").order("date"),
    supabaseClient.from("scores").select("*"),
  ]);

  const players = (playersRes.data || []) as Player[];
  const events = (eventsRes.data || []) as Event[];
  const scores = (scoresRes.data || []) as Score[];

  // Build leaderboard data
  const leaderboardPlayers: LeaderboardPlayer[] = players.map((player) => {
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

    return {
      player,
      events: eventScores,
      totalGross,
      totalNet,
      position: 0, // Will be calculated in component
    };
  });

  return { players: leaderboardPlayers, events };
}

export default async function Home() {
  const { players, events } = await getLeaderboardData();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-augusta-green mb-2">
          Tournament Leaderboard
        </h1>
        <p className="text-gray-600">Current standings and scores</p>
      </div>

      <LeaderboardTable players={players} events={events} />

      <div className="text-center text-sm text-gray-500">
        <p>Net Score = Gross Score - Handicap</p>
        <p>Lower scores are better</p>
      </div>
    </div>
  );
}
