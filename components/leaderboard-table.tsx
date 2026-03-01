"use client";

import { Event, LeaderboardPlayer } from "@/lib/types";
import { useState } from "react";

interface LeaderboardTableProps {
  players: LeaderboardPlayer[];
  events: Event[];
}

export function LeaderboardTable({ players, events }: LeaderboardTableProps) {
  const [sortBy, setSortBy] = useState<"net" | "gross">("net");

  const sortedPlayers = [...players].sort((a, b) => {
    if (sortBy === "net") {
      return a.totalNet - b.totalNet;
    }
    return a.totalGross - b.totalGross;
  });

  // Assign positions
  const playersWithPosition = sortedPlayers.map((player, index) => ({
    ...player,
    position: index + 1,
  }));

  if (players.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow p-6 md:p-8 text-center text-gray-600">
        <p className="text-lg">No hay scores disponibles todavía.</p>
        <p className="text-sm mt-2">¡Vuelve pronto para ver las posiciones!</p>
      </div>
    );
  }

  return (
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
                onClick={() => setSortBy("gross")}
              >
                <span className="hidden md:inline">Total </span>Bruto{" "}
                {sortBy === "gross" && "↓"}
              </th>
              <th
                className="px-3 md:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-augusta-green-dark"
                onClick={() => setSortBy("net")}
              >
                <span className="hidden md:inline">Total </span>Neto{" "}
                {sortBy === "net" && "↓"}
              </th>
              {events.map((event) => (
                <th
                  key={event.id}
                  className="px-3 md:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                >
                  <div>{event.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {playersWithPosition.map((player, idx) => (
              <tr
                key={player.player.id}
                className={idx < 3 ? "bg-augusta-gold bg-opacity-10" : ""}
              >
                <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {player.position === 1 && "🏆 "}
                  {player.position}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {player.player.name}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-center font-medium">
                  {player.totalGross}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-center font-bold text-augusta-green">
                  {player.totalNet}
                </td>
                {events.map((event) => {
                  const eventScore = player.events[event.id];
                  return (
                    <td
                      key={event.id}
                      className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-center"
                    >
                      {eventScore ? (
                        <div>
                          <div className="font-medium">{eventScore.net}</div>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
