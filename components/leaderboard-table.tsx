"use client";

import { Event, LeaderboardPlayer } from "@/lib/types";
import { useState } from "react";

interface LeaderboardTableProps {
  players: LeaderboardPlayer[];
  events: Event[];
}

function shortEventHeader(event: Event): string {
  const [, month, day] = event.date.split("-");
  return `${parseInt(day)}/${parseInt(month)}`;
}

export function LeaderboardTable({ players, events }: LeaderboardTableProps) {
  const [sortBy, setSortBy] = useState<"net" | "gross">("net");
  const [showEvents, setShowEvents] = useState(false);

  const manyEvents = events.length > 4;

  const sortedPlayers = [...players].sort((a, b) => {
    const aHasScores = Object.keys(a.events).length > 0;
    const bHasScores = Object.keys(b.events).length > 0;
    if (aHasScores && !bHasScores) return -1;
    if (!aHasScores && bHasScores) return 1;
    if (!aHasScores && !bHasScores) return 0;
    if (sortBy === "net") return a.totalNet - b.totalNet;
    return a.totalGross - b.totalGross;
  });

  const playersWithPosition = sortedPlayers.map((player, index) => ({
    ...player,
    position: index + 1,
  }));

  if (players.length === 0) {
    return (
      <div className="bg-white/95 mb-3 backdrop-blur-sm rounded-lg shadow p-6 md:p-8 text-center text-gray-600">
        <p className="text-lg">No hay scores disponibles todavía.</p>
        <p className="text-sm mt-2">¡Vuelve pronto para ver las posiciones!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {manyEvents && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowEvents(!showEvents)}
            className="flex items-center gap-1.5 text-sm text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
            title={
              showEvents ? "Ocultar detalle por fecha" : "Ver detalle por fecha"
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            {showEvents ? "Ocultar fechas" : "Ver fechas"}
          </button>
        </div>
      )}

      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-augusta-green text-white">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Pos
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Jugador
                </th>
                <th
                  className="px-3 md:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-augusta-green-dark"
                  onClick={() => setSortBy("net")}
                >
                  <span className="hidden md:inline">Total </span>Neto{" "}
                  {sortBy === "net" && "↓"}
                </th>
                <th
                  className="px-3 md:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-augusta-green-dark"
                  onClick={() => setSortBy("gross")}
                >
                  <span className="hidden md:inline">Total </span>Bruto{" "}
                  {sortBy === "gross" && "↓"}
                </th>
                {(!manyEvents || showEvents) &&
                  events.map((event) => (
                    <th
                      key={event.id}
                      className="px-2 md:px-4 py-3 text-center text-xs font-medium uppercase tracking-wider"
                    >
                      {manyEvents ? shortEventHeader(event) : event.name}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {playersWithPosition.map((player, idx) => {
                const hasScores = Object.keys(player.events).length > 0;
                return (
                  <tr
                    key={player.player.id}
                    className={
                      hasScores && idx < 3
                        ? "bg-augusta-gold bg-opacity-10"
                        : ""
                    }
                  >
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {hasScores && player.position === 1 && "🏆 "}
                      {hasScores ? player.position : "-"}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {player.player.name}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-center font-bold text-augusta-green">
                      {hasScores ? (
                        player.totalNet
                      ) : (
                        <span className="text-gray-400 font-normal text-xs">
                          NPT
                        </span>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-center font-medium">
                      {hasScores ? (
                        player.totalGross
                      ) : (
                        <span className="text-gray-400 text-xs">NPT</span>
                      )}
                    </td>
                    {(!manyEvents || showEvents) &&
                      events.map((event) => {
                        const eventScore = player.events[event.id];
                        return (
                          <td
                            key={event.id}
                            className="px-2 md:px-4 py-3 md:py-4 whitespace-nowrap text-sm text-center"
                          >
                            {eventScore ? (
                              <div>
                                <div className="font-medium">
                                  {eventScore.net}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ({eventScore.gross})
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
