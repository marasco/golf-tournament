import { supabaseClient } from "@/lib/supabase/client";
import { Tournament } from "@/lib/types";
import Link from "next/link";

async function getTournaments() {
  const { data } = await supabaseClient
    .from("tournaments")
    .select("*")
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });
  return (data || []) as Tournament[];
}

export default async function Home() {
  const tournaments = await getTournaments();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
          Torneos
        </h1>
        <p className="text-white text-lg drop-shadow">
          Seleccioná un torneo para ver el leaderboard
        </p>
      </div>

      <div className="space-y-6">
        {tournaments.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow p-8 text-center text-gray-600">
            <p className="text-lg">No hay torneos disponibles todavía.</p>
          </div>
        ) : (
          tournaments.map((tournament) => (
            <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer mb-3 p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-augusta-green">
                      {tournament.name}
                    </h2>
                    {tournament.description && (
                      <p className="text-gray-600 text-sm mt-1">
                        {tournament.description}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                      {tournament.year}
                    </p>
                  </div>
                  {tournament.is_active && (
                    <span className="bg-augusta-green text-white text-xs font-medium px-3 py-1 rounded-full">
                      Activo
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
