export interface Player {
  id: string;
  name: string;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  course_name: string;
  date: string;
  created_at: string;
}

export interface Score {
  id: string;
  player_id: string;
  event_id: string;
  handicap: number;
  gross_score: number;
  created_at: string;
}

export interface ScoreWithDetails extends Score {
  player: Player;
  event: Event;
}

export interface LeaderboardPlayer {
  player: Player;
  events: {
    [eventId: string]: {
      gross: number;
      net: number;
      handicap: number;
    };
  };
  totalGross: number;
  totalNet: number;
  position: number;
}
