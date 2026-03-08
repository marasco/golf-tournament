"use client";

import { useCurrentPlayer } from "@/lib/use-current-player";
import { use, useCallback, useEffect, useRef, useState } from "react";

interface HoleData {
  id: string;
  hole_number: number;
  par: number;
  strokes: number | null;
  scorer_strokes: number | null;
}

interface RoundDetail {
  id: string;
  handicap: number;
  status: string;
  event_id: string;
  scorer_id: string;
  player: { name: string };
  scorer: { name: string };
  event: {
    id: string;
    name: string;
    date: string;
    tournament_id: string | null;
    course_id: string | null;
  };
}

type SaveStatus = "" | "saving" | "saved" | "error" | "offline";

function formatVsPar(n: number) {
  if (n > 0) return `+${n}`;
  if (n === 0) return "E";
  return `${n}`;
}

function getLastName(name: string) {
  const parts = name.trim().split(" ");
  return parts[parts.length - 1];
}

// ── Offline helpers ──────────────────────────────────────────────────────────

function cacheKey(roundId: string) {
  return `round_cache_${roundId}`;
}
function queueKey(roundId: string) {
  return `round_queue_${roundId}`;
}

function readCache(roundId: string): any | null {
  try {
    const raw = localStorage.getItem(cacheKey(roundId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(roundId: string, data: any) {
  try {
    localStorage.setItem(cacheKey(roundId), JSON.stringify(data));
  } catch {}
}

type QueueEntry = { strokes: number | null; scorer_strokes: number | null };

function readQueue(roundId: string): Record<number, QueueEntry> {
  try {
    const raw = localStorage.getItem(queueKey(roundId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeQueue(roundId: string, queue: Record<number, QueueEntry>) {
  try {
    localStorage.setItem(queueKey(roundId), JSON.stringify(queue));
  } catch {}
}

function removeFromQueue(roundId: string, holeNumber: number) {
  const q = readQueue(roundId);
  delete q[holeNumber];
  writeQueue(roundId, q);
}

function addToQueue(
  roundId: string,
  holeNumber: number,
  data: QueueEntry
) {
  const q = readQueue(roundId);
  q[holeNumber] = data;
  writeQueue(roundId, q);
}

// ─────────────────────────────────────────────────────────────────────────────

function buildHolesFromData(data: any): HoleData[] {
  const scoresMap: Record<number, QueueEntry> = {};
  (data.hole_scores || []).forEach((hs: any) => {
    scoresMap[hs.hole_number] = {
      strokes: hs.strokes ?? null,
      scorer_strokes: hs.scorer_strokes ?? null,
    };
  });

  const holesData: HoleData[] = (data.holes || []).map((h: any) => ({
    id: h.id,
    hole_number: h.hole_number,
    par: h.par,
    strokes: scoresMap[h.hole_number]?.strokes ?? null,
    scorer_strokes: scoresMap[h.hole_number]?.scorer_strokes ?? null,
  }));

  for (let i = holesData.length + 1; i <= 18; i++) {
    holesData.push({
      id: "",
      hole_number: i,
      par: 4,
      strokes: scoresMap[i]?.strokes ?? null,
      scorer_strokes: scoresMap[i]?.scorer_strokes ?? null,
    });
  }
  return holesData;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function RoundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: roundId } = use(params);

  const [round, setRound] = useState<RoundDetail | null>(null);
  const [holes, setHoles] = useState<HoleData[]>([]);
  const [partnerMap, setPartnerMap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("");
  const [offlineCount, setOfflineCount] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [noCourse, setNoCourse] = useState(false);
  const { player: currentPlayer } = useCurrentPlayer();

  const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const pendingScores = useRef<Record<number, QueueEntry>>({});

  // ── Load round (network first, cache fallback) ──────────────────────────

  const applyRoundData = useCallback(
    (data: any, mergeOfflineQueue = false) => {
      setRound(data);

      if (!data.event?.course_id) {
        setNoCourse(true);
        return;
      }

      let holesData = buildHolesFromData(data);

      // Overlay any unsaved offline entries on top of server data
      if (mergeOfflineQueue) {
        const queue = readQueue(roundId);
        holesData = holesData.map((h) => {
          const queued = queue[h.hole_number];
          return queued ? { ...h, ...queued } : h;
        });
        setOfflineCount(Object.keys(queue).length);
      }

      setHoles(holesData);

      const mirror: Record<number, number> = {};
      (data.mirror_hole_scores || []).forEach((hs: any) => {
        if (hs.strokes != null) mirror[hs.hole_number] = hs.strokes;
      });
      setPartnerMap(mirror);
    },
    [roundId]
  );

  useEffect(() => {
    const loadRound = async () => {
      try {
        const res = await fetch(`/api/rounds/${roundId}`);
        if (res.ok) {
          const data = await res.json();
          writeCache(roundId, data);
          applyRoundData(data, true);
          return;
        }
      } catch {
        // network failure — fall through to cache
      }

      // Offline fallback
      const cached = readCache(roundId);
      if (cached) {
        applyRoundData(cached, true);
      }
      setLoading(false);
    };

    loadRound().finally(() => setLoading(false));
  }, [roundId, applyRoundData]);

  // ── Mirror polling (every 1 min, silent on failure) ──────────────────────

  useEffect(() => {
    const refreshMirror = async () => {
      try {
        const res = await fetch(`/api/rounds/${roundId}`);
        if (!res.ok) return;
        const data = await res.json();
        writeCache(roundId, data);
        const mirror: Record<number, number> = {};
        (data.mirror_hole_scores || []).forEach((hs: any) => {
          if (hs.strokes != null) mirror[hs.hole_number] = hs.strokes;
        });
        setPartnerMap(mirror);
      } catch {}
    };

    const interval = setInterval(refreshMirror, 60 * 1000);
    return () => clearInterval(interval);
  }, [roundId]);

  // ── Offline queue flush when connection returns ───────────────────────────

  const flushQueue = useCallback(async () => {
    const queue = readQueue(roundId);
    const entries = Object.entries(queue) as [string, QueueEntry][];
    if (entries.length === 0) return;

    setSaveStatus("saving");
    let remaining = entries.length;

    for (const [holeStr, data] of entries) {
      const holeNumber = parseInt(holeStr);
      try {
        const res = await fetch(`/api/rounds/${roundId}/hole-scores`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hole_number: holeNumber, ...data }),
        });
        if (res.ok) {
          removeFromQueue(roundId, holeNumber);
          remaining--;
        }
      } catch {}
    }

    setOfflineCount(remaining);
    if (remaining === 0) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus((s) => (s === "saved" ? "" : s)), 2000);
    } else {
      setSaveStatus("offline");
    }
  }, [roundId]);

  useEffect(() => {
    window.addEventListener("online", flushQueue);
    return () => window.removeEventListener("online", flushQueue);
  }, [flushQueue]);

  // ── Save hole (queues offline if no connection) ───────────────────────────

  const saveHole = useCallback(
    async (
      holeNumber: number,
      data: QueueEntry
    ) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/rounds/${roundId}/hole-scores`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hole_number: holeNumber, ...data }),
        });
        if (!res.ok) throw new Error();
        removeFromQueue(roundId, holeNumber);
        setOfflineCount(Object.keys(readQueue(roundId)).length);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus((s) => (s === "saved" ? "" : s)), 2000);
      } catch {
        addToQueue(roundId, holeNumber, data);
        setOfflineCount(Object.keys(readQueue(roundId)).length);
        setSaveStatus("offline");
      }
    },
    [roundId]
  );

  // ── Input change handler ──────────────────────────────────────────────────

  const handleChange = (
    holeNumber: number,
    field: "strokes" | "scorer_strokes",
    value: string
  ) => {
    if (value !== "" && !/^\d+$/.test(value)) return;

    const num = value === "" || parseInt(value) <= 0 ? null : parseInt(value);

    setHoles((prev) =>
      prev.map((h) =>
        h.hole_number === holeNumber ? { ...h, [field]: num } : h
      )
    );

    const current = pendingScores.current[holeNumber] ?? {
      strokes: holes.find((h) => h.hole_number === holeNumber)?.strokes ?? null,
      scorer_strokes:
        holes.find((h) => h.hole_number === holeNumber)?.scorer_strokes ?? null,
    };
    pendingScores.current[holeNumber] = { ...current, [field]: num };

    if (saveTimers.current[holeNumber])
      clearTimeout(saveTimers.current[holeNumber]);
    saveTimers.current[holeNumber] = setTimeout(() => {
      const pending = pendingScores.current[holeNumber];
      if (pending !== undefined) {
        saveHole(holeNumber, pending);
        delete pendingScores.current[holeNumber];
      }
    }, 2000);
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (
      !confirm("¿Cancelar esta ronda? Se borrarán todos los scores cargados.")
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/rounds/${roundId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al cancelar");
        return;
      }
      try {
        localStorage.removeItem(cacheKey(roundId));
        localStorage.removeItem(queueKey(roundId));
      } catch {}
      window.location.href = "/play";
    } finally {
      setDeleting(false);
    }
  };

  const handleComplete = async () => {
    if (offlineCount > 0) {
      if (
        !confirm(
          `Tenés ${offlineCount} score(s) sin sincronizar. ¿Intentar sincronizar y finalizar?`
        )
      )
        return;
      await flushQueue();
      if (Object.keys(readQueue(roundId)).length > 0) {
        alert("No se pudieron sincronizar todos los scores. Intentá con señal.");
        return;
      }
    } else {
      if (
        !confirm("¿Finalizar la ronda? No podrás modificar los scores después.")
      )
        return;
    }
    setCompleting(true);
    try {
      const res = await fetch(`/api/rounds/${roundId}/complete`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al finalizar");
        return;
      }
      try {
        localStorage.removeItem(cacheKey(roundId));
        localStorage.removeItem(queueKey(roundId));
      } catch {}
      if (round?.event?.tournament_id) {
        window.location.href = `/tournaments/${round.event.tournament_id}`;
      } else {
        window.location.href = "/";
      }
    } finally {
      setCompleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg drop-shadow">Cargando...</div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="text-white text-center py-12">Ronda no encontrada.</div>
    );
  }

  if (noCourse) {
    return (
      <div className="max-w-md mx-auto bg-white/95 rounded-lg shadow p-6 text-center text-gray-600">
        <p className="font-medium">Este evento no tiene una cancha asignada.</p>
        <p className="text-sm mt-1">
          Asigná una cancha al evento desde el admin.
        </p>
      </div>
    );
  }

  const isCompleted = round.status === "completed";
  const playedHoles = holes.filter(
    (h) => h.strokes !== null || h.scorer_strokes !== null
  );
  const holesWithStrokes = holes.filter((h) => h.strokes !== null);
  const strokesVsPar = holesWithStrokes.reduce(
    (sum, h) => sum + (h.strokes! - h.par),
    0
  );
  const projectedNet = strokesVsPar - round.handicap;
  const totalPar = holes.reduce((s, h) => s + h.par, 0);
  const [, eventMonth, eventDay] = round.event.date.split("-");
  const scorerLastName = getLastName(round.scorer.name);
  const playerLastName = getLastName(round.player.name);
  const isScorer = currentPlayer?.id === round.scorer_id;

  const inputClass =
    "w-full text-center border border-gray-300 rounded py-2 text-3xl font-bold disabled:bg-gray-50 disabled:text-gray-400 focus:border-augusta-green focus:outline-none";

  return (
    <div className="max-w-lg mx-auto space-y-2 px-1">
      {/* Scorecard */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <table className="w-full table-fixed text-base">
          <colgroup>
            <col />
            <col className="w-[35%]" />
            <col className="w-[35%]" />
            <col className="w-12" />
          </colgroup>
          <thead className="bg-augusta-green text-white text-md">
            <tr>
              <th className="px-2 py-1.5 text-left">Hoyo</th>
              <th className="px-1 py-1.5 text-center">{scorerLastName}</th>
              <th className="px-1 py-1.5 text-center font-bold">
                {playerLastName}
              </th>
              <th className="px-1 py-1.5 text-center">+/-</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {holes.map((hole) => {
              const vsParHole =
                hole.strokes !== null ? hole.strokes - hole.par : null;
              return (
                <tr
                  key={hole.hole_number}
                  className={hole.hole_number % 2 === 0 ? "bg-gray-50/50" : ""}
                >
                  <td className="px-2 py-1 text-2xl font-semibold text-gray-700 whitespace-nowrap">
                    {hole.hole_number}{" "}
                    <span className="text-gray-400 text-sm font-normal">
                      P{hole.par}
                    </span>
                  </td>
                  <td className="px-1 py-1 text-center">
                    {(() => {
                      const partnerVal = isScorer
                        ? partnerMap[hole.hole_number]
                        : undefined;
                      const myVal = hole.scorer_strokes;
                      const mismatch =
                        partnerVal !== undefined &&
                        myVal !== null &&
                        myVal !== partnerVal;
                      return (
                        <input
                          type="text"
                          inputMode="numeric"
                          disabled={isCompleted}
                          value={myVal ?? ""}
                          placeholder={
                            partnerVal !== undefined ? String(partnerVal) : ""
                          }
                          onChange={(e) =>
                            handleChange(
                              hole.hole_number,
                              "scorer_strokes",
                              e.target.value
                            )
                          }
                          className={`${inputClass} ${mismatch ? "bg-red-100 border-red-400 text-red-700" : ""}`}
                          style={{ minWidth: 0 }}
                        />
                      );
                    })()}
                  </td>
                  <td className="px-1 py-1 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={isCompleted}
                      value={hole.strokes ?? ""}
                      onChange={(e) =>
                        handleChange(
                          hole.hole_number,
                          "strokes",
                          e.target.value
                        )
                      }
                      className={inputClass}
                      style={{ minWidth: 0 }}
                    />
                  </td>
                  <td
                    className={`px-1 py-1 text-center font-semibold text-xl ${
                      vsParHole === null
                        ? "text-gray-300"
                        : vsParHole < 0
                        ? "text-augusta-green"
                        : vsParHole === 0
                        ? "text-gray-500"
                        : "text-red-500"
                    }`}
                  >
                    {vsParHole === null ? "—" : formatVsPar(vsParHole)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-100 border-t-2 border-gray-300 text-md font-bold">
            <tr>
              <td className="px-2 py-2 text-gray-600">
                <span className="text-md font-normal text-gray-400">
                  P{totalPar}
                </span>
              </td>
              <td className="px-1 py-2 text-center">
                {holes.reduce((s, h) => s + (h.scorer_strokes || 0), 0) || "—"}
              </td>
              <td className="px-1 py-2 text-center text-augusta-green">
                {holes.reduce((s, h) => s + (h.strokes || 0), 0) || "—"}
              </td>
              <td
                className={`px-1 py-2 text-center ${
                  strokesVsPar <= 0 ? "text-augusta-green" : "text-red-500"
                }`}
              >
                {playedHoles.length > 0 ? formatVsPar(strokesVsPar) : "—"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Save / offline status */}
      {(saveStatus || offlineCount > 0) && (
        <div
          className={`text-center text-sm py-1.5 rounded-lg flex items-center justify-center gap-2 ${
            saveStatus === "saving"
              ? "bg-white/10 text-white/70"
              : saveStatus === "saved"
              ? "bg-green-500/20 text-green-100"
              : offlineCount > 0 || saveStatus === "offline"
              ? "bg-orange-500/80 text-white"
              : "bg-red-500/20 text-red-200"
          }`}
        >
          {saveStatus === "saving" && "Guardando..."}
          {saveStatus === "saved" && "✓ Guardado"}
          {saveStatus === "error" && "Error al guardar"}
          {(saveStatus === "offline" || (saveStatus === "" && offlineCount > 0)) && (
            <>
              <span>Sin señal — {offlineCount} score(s) pendiente(s)</span>
              <button
                onClick={flushQueue}
                className="underline text-white/80 hover:text-white text-xs"
              >
                Reintentar
              </button>
            </>
          )}
        </div>
      )}

      {/* Player info + stats */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow p-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-augusta-green leading-tight">
              {round.player.name}
            </h1>
            <p className="text-sm text-gray-600">
              {round.event.name} · {parseInt(eventDay)}/{parseInt(eventMonth)}
            </p>
            <p className="text-xs text-gray-400">
              Marcador: {round.scorer.name}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-3xl font-bold ${
                strokesVsPar <= 0 ? "text-augusta-green" : "text-red-500"
              }`}
            >
              {playedHoles.length > 0 ? formatVsPar(strokesVsPar) : "—"}
            </div>
            <div className="text-xs text-gray-400">vs par</div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-base font-semibold text-gray-800">
              {playedHoles.length}/18
            </div>
            <div className="text-xs text-gray-400">Hoyos</div>
          </div>
          <div>
            <div
              className={`text-base font-semibold ${
                strokesVsPar <= 0 ? "text-augusta-green" : "text-red-500"
              }`}
            >
              {playedHoles.length > 0 ? formatVsPar(strokesVsPar) : "—"}
            </div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
          <div>
            <div
              className={`text-base font-semibold ${
                projectedNet <= 0 ? "text-augusta-green" : "text-red-500"
              }`}
            >
              {formatVsPar(projectedNet)}
            </div>
            <div className="text-xs text-gray-400">Proyectado</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!isCompleted ? (
        <div
          className={`grid gap-2 ${isScorer ? "grid-cols-2" : "grid-cols-1"}`}
        >
          <button
            onClick={handleComplete}
            disabled={completing || playedHoles.length === 0}
            className="bg-augusta-green text-white py-3 rounded-lg text-base font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {completing ? "Finalizando..." : "Finalizar"}
          </button>
          {isScorer && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 text-white py-3 rounded-lg text-base font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {deleting ? "Cancelando..." : "Cancelar"}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center bg-white/20 text-white py-3 rounded-lg text-sm font-medium">
          ✓ Ronda finalizada —{" "}
          <span className="font-bold">
            {holes.reduce((s, h) => s + (h.strokes || 0), 0)} golpes
          </span>
        </div>
      )}

      {round.event.tournament_id && (
        <a
          href={`/tournaments/${round.event.tournament_id}/live`}
          className="block w-full bg-orange-500 text-white font-bold text-center py-3 rounded-lg text-base hover:opacity-90 transition-opacity"
        >
          Ver tablero en vivo →
        </a>
      )}
    </div>
  );
}
