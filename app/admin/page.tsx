"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { Event, Player, ScoreWithDetails, Tournament } from "@/lib/types";
import { useEffect, useState } from "react";
import { EventForm } from "./components/event-form";
import { PlayerForm } from "./components/player-form";
import { ScoreForm } from "./components/score-form";
import { TournamentForm } from "./components/tournament-form";

type Tab = "tournaments" | "players" | "events" | "scores";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tournaments");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [scores, setScores] = useState<ScoreWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tournamentsRes, playersRes, eventsRes, scoresRes] = await Promise.all([
        supabaseClient.from("tournaments").select("*").order("year", { ascending: false }),
        supabaseClient.from("players").select("*").order("name"),
        supabaseClient.from("events").select("*").order("date", { ascending: true }),
        supabaseClient.from("scores").select("*"),
      ]);

      const tournamentsData = (tournamentsRes.data || []) as Tournament[];
      const playersData = (playersRes.data || []) as Player[];
      const eventsData = (eventsRes.data || []) as Event[];
      const scoresData = scoresRes.data || [];

      const enrichedScores: ScoreWithDetails[] = scoresData.map((score: any) => {
        const player = playersData.find((p) => p.id === score.player_id);
        const event = eventsData.find((e) => e.id === score.event_id);
        return {
          ...score,
          player: player || { id: "", name: "Unknown", created_at: "" },
          event: event || {
            id: "",
            name: "Unknown",
            course_name: "",
            date: "",
            created_at: "",
          },
        };
      });

      setTournaments(tournamentsData);
      setPlayers(playersData);
      setEvents(eventsData);
      setScores(enrichedScores);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg drop-shadow">Cargando...</div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "tournaments", label: "Torneos", count: tournaments.length },
    { key: "players", label: "Jugadores", count: players.length },
    { key: "events", label: "Eventos", count: events.length },
    { key: "scores", label: "Scores", count: scores.length },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 overflow-x-auto px-6">
        <nav className="-mb-px flex space-x-4 md:space-x-8 min-w-max md:min-w-0">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-4 px-2 md:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === key
                  ? "border-augusta-green text-augusta-green"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "tournaments" && <TournamentForm tournaments={tournaments} />}
        {activeTab === "players" && <PlayerForm players={players} />}
        {activeTab === "events" && <EventForm events={events} tournaments={tournaments} />}
        {activeTab === "scores" && (
          <ScoreForm players={players} events={events} scores={scores} />
        )}
      </div>
    </div>
  );
}
