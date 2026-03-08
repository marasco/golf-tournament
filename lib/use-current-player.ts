"use client";

import { useEffect, useState } from "react";

export interface CurrentPlayer {
  id: string;
  name: string;
}

export function useCurrentPlayer() {
  const [player, setPlayer] = useState<CurrentPlayer | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("current_player");
      if (stored) setPlayer(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  const login = (p: CurrentPlayer) => {
    localStorage.setItem("current_player", JSON.stringify(p));
    setPlayer(p);
  };

  const logout = () => {
    localStorage.removeItem("current_player");
    setPlayer(null);
  };

  return { player, login, logout, loaded };
}
