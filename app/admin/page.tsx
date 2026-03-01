"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { Event, Player, ScoreWithDetails } from "@/lib/types";
import { useEffect, useState } from "react";
import { EventForm } from "./components/event-form";
import { PlayerForm } from "./components/player-form";
import { ScoreForm } from "./components/score-form";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"players" | "events" | "scores">(
    "players"
  );
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
      const [playersRes, eventsRes, scoresRes] = await Promise.all([
        supabaseClient.from("players").select("*").order("name"),
        supabaseClient.from("events").select("*").order("date", { ascending: false }),
        supabaseClient.from("scores").select("*"),
      ]);

      const playersData = (playersRes.data || []) as Player[];
      const eventsData = (eventsRes.data || []) as Event[];
      const scoresData = scoresRes.data || [];

      // Enrich scores with player and event data
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
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("players")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "players"
                ? "border-augusta-green text-augusta-green"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Players ({players.length})
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "events"
                ? "border-augusta-green text-augusta-green"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("scores")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "scores"
                ? "border-augusta-green text-augusta-green"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Scores ({scores.length})
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "players" && <PlayerForm players={players} />}
        {activeTab === "events" && <EventForm events={events} />}
        {activeTab === "scores" && (
          <ScoreForm players={players} events={events} scores={scores} />
        )}
      </div>
    </div>
  );
}
