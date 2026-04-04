"use client";

import { Event, LeaderboardPlayer } from "@/lib/types";
import { useState } from "react";

interface LeaderboardTableProps {
  players: LeaderboardPlayer[];
  events: Event[];
}

type SortKey =
  | "position"
  | "player"
  | "net"
  | "gross"
  | "matches"
  | "avgNet"
  | `event:${string}`;

type SortDirection = "asc" | "desc";

function shortEventHeader(event: Event): string {
  const [, month, day] = event.date.split("-");
  return `${parseInt(day)}/${parseInt(month)}`;
}

export function LeaderboardTable({ players, events }: LeaderboardTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({ key: "net", direction: "asc" });
  const [showEvents, setShowEvents] = useState(false);

  const manyEvents = events.length > 4;

  const rankedPlayers = [...players].sort((a, b) => {
    const aHasScores = Object.keys(a.events).length > 0;
    const bHasScores = Object.keys(b.events).length > 0;
    if (aHasScores && !bHasScores) return -1;
    if (!aHasScores && bHasScores) return 1;
    if (!aHasScores && !bHasScores) return 0;
    return a.totalNet - b.totalNet;
  });

  const rankingByPlayerId = new Map(
    rankedPlayers
      .filter((player) => Object.keys(player.events).length > 0)
      .map((player, index) => [player.player.id, index + 1] as const),
  );

  const getMatches = (player: LeaderboardPlayer) =>
    Object.keys(player.events).length;

  const getAverageNet = (player: LeaderboardPlayer): number | null => {
    const matches = getMatches(player);
    return matches > 0 ? player.totalNet / matches : null;
  };

  const getEventNet = (
    player: LeaderboardPlayer,
    eventId: string,
  ): number | null => {
    const eventScore = player.events[eventId];
    return eventScore ? eventScore.net : null;
  };

  const compareNullableNumbers = (
    a: number | null,
    b: number | null,
    direction: SortDirection,
  ) => {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return direction === "asc" ? a - b : b - a;
  };

  const compareBySortKey = (
    a: LeaderboardPlayer,
    b: LeaderboardPlayer,
    key: SortKey,
    direction: SortDirection,
  ) => {
    if (key === "player") {
      const nameCompare = a.player.name.localeCompare(b.player.name, "es", {
        sensitivity: "base",
      });
      return direction === "asc" ? nameCompare : -nameCompare;
    }

    if (key === "position") {
      const aPosition = rankingByPlayerId.get(a.player.id) ?? null;
      const bPosition = rankingByPlayerId.get(b.player.id) ?? null;
      return compareNullableNumbers(aPosition, bPosition, direction);
    }

    if (key === "net") {
      return compareNullableNumbers(
        getMatches(a) > 0 ? a.totalNet : null,
        getMatches(b) > 0 ? b.totalNet : null,
        direction,
      );
    }

    if (key === "gross") {
      return compareNullableNumbers(
        getMatches(a) > 0 ? a.totalGross : null,
        getMatches(b) > 0 ? b.totalGross : null,
        direction,
      );
    }

    if (key === "matches") {
      return compareNullableNumbers(getMatches(a), getMatches(b), direction);
    }

    if (key === "avgNet") {
      return compareNullableNumbers(
        getAverageNet(a),
        getAverageNet(b),
        direction,
      );
    }

    if (key.startsWith("event:")) {
      const eventId = key.replace("event:", "");
      return compareNullableNumbers(
        getEventNet(a, eventId),
        getEventNet(b, eventId),
        direction,
      );
    }

    return 0;
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const primary = compareBySortKey(
      a,
      b,
      sortConfig.key,
      sortConfig.direction,
    );
    if (primary !== 0) return primary;

    return a.player.name.localeCompare(b.player.name, "es", {
      sensitivity: "base",
    });
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((current: { key: SortKey; direction: SortDirection }) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: "asc",
      };
    });
  };

  const sortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const playersWithPosition = sortedPlayers.map((player) => ({
    ...player,
    position: rankingByPlayerId.get(player.player.id) ?? 0,
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
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => handleSort("position")}
                  >
                    Pos {sortIndicator("position")}
                  </button>
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => handleSort("player")}
                  >
                    Jugador {sortIndicator("player")}
                  </button>
                </th>
                <th
                  className="px-3 md:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-augusta-green-dark"
                  onClick={() => handleSort("net")}
                >
                  <span className="hidden md:inline">Total </span>Neto{" "}
                  {sortIndicator("net")}
                </th>
                <th
                  className="px-3 md:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-augusta-green-dark"
                  onClick={() => handleSort("gross")}
                >
                  <span className="hidden md:inline">Total </span>Bruto{" "}
                  {sortIndicator("gross")}
                </th>
                <th
                  className="px-3 md:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-augusta-green-dark"
                  onClick={() => handleSort("matches")}
                >
                  Matches {sortIndicator("matches")}
                </th>
                <th
                  className="px-3 md:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-augusta-green-dark"
                  onClick={() => handleSort("avgNet")}
                >
                  Prom Neto {sortIndicator("avgNet")}
                </th>
                {(!manyEvents || showEvents) &&
                  events.map((event) => (
                    <th
                      key={event.id}
                      className="px-2 md:px-4 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-augusta-green-dark"
                      onClick={() => handleSort(`event:${event.id}`)}
                    >
                      {manyEvents ? shortEventHeader(event) : event.name}{" "}
                      {sortIndicator(`event:${event.id}`)}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {playersWithPosition.map((player) => {
                const hasScores = Object.keys(player.events).length > 0;
                return (
                  <tr
                    key={player.player.id}
                    className={
                      hasScores && player.position <= 3
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
                        <span>
                          {player.totalNet}{" "}
                          {(() => {
                            const rounds = Object.keys(player.events).length;
                            const par = rounds * 72;
                            const diff = player.totalNet - par;
                            return (
                              <span className="font-normal text-xs text-gray-500">
                                (
                                {diff > 0
                                  ? `+${diff}`
                                  : diff === 0
                                    ? "E"
                                    : diff}
                                )
                              </span>
                            );
                          })()}
                        </span>
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
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-center font-medium">
                      {getMatches(player)}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-center font-medium">
                      {hasScores ? (
                        getAverageNet(player)?.toFixed(2)
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
