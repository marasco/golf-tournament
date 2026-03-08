-- ─────────────────────────────────────────────
-- COURSES
-- ─────────────────────────────────────────────
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON courses FOR SELECT USING (true);

-- ─────────────────────────────────────────────
-- HOLES (par + stroke index per hole)
-- ─────────────────────────────────────────────
CREATE TABLE holes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  par INTEGER NOT NULL DEFAULT 4 CHECK (par BETWEEN 3 AND 5),
  UNIQUE(course_id, hole_number)
);

ALTER TABLE holes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON holes FOR SELECT USING (true);

-- ─────────────────────────────────────────────
-- EVENTS: add course_id (keeps course_name for now)
-- ─────────────────────────────────────────────
ALTER TABLE events ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
CREATE INDEX idx_events_course_id ON events(course_id);

-- ─────────────────────────────────────────────
-- ROUNDS (un partido = un jugador en un evento)
-- scorer_id = quien cargó los scores (backup)
-- ─────────────────────────────────────────────
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  scorer_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  handicap INTEGER NOT NULL CHECK (handicap >= 0),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, player_id)
);

ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON rounds FOR SELECT USING (true);
CREATE INDEX idx_rounds_event_id ON rounds(event_id);
CREATE INDEX idx_rounds_player_id ON rounds(player_id);

-- ─────────────────────────────────────────────
-- HOLE SCORES
-- ─────────────────────────────────────────────
CREATE TABLE hole_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  strokes INTEGER CHECK (strokes > 0),  -- NULL = hoyo no jugado aún
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(round_id, hole_number)
);

ALTER TABLE hole_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON hole_scores FOR SELECT USING (true);
CREATE INDEX idx_hole_scores_round_id ON hole_scores(round_id);
