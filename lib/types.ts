export interface Course {
  id: string;
  name: string;
  created_at: string;
}

export interface Hole {
  id: string;
  course_id: string;
  hole_number: number;
  par: number;
}

export interface Round {
  id: string;
  event_id: string;
  player_id: string;
  scorer_id: string;
  handicap: number;
  status: "in_progress" | "completed";
  created_at: string;
}

export interface HoleScore {
  id: string;
  round_id: string;
  hole_number: number;
  strokes: number | null;
  scorer_strokes: number | null;
  updated_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  year: number;
  is_active: boolean;
  created_at: string;
}

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
  tournament_id?: string;
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
