-- Tournaments table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  year INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON tournaments FOR SELECT USING (true);

-- Add tournament reference to events
ALTER TABLE events ADD COLUMN tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL;
CREATE INDEX idx_events_tournament_id ON events(tournament_id);
