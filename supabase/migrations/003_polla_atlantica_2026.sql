-- Create the main annual tournament
WITH new_tournament AS (
  INSERT INTO tournaments (name, description, year, is_active)
  VALUES (
    'Polla Atlántica 2026',
    'Torneo anual — todos los sábados',
    2026,
    true
  )
  RETURNING id
)
-- Insert one event per Saturday from 2026-03-07 to 2026-12-12
INSERT INTO events (name, course_name, date, tournament_id)
SELECT
  'Jornada ' || ROW_NUMBER() OVER (ORDER BY d),
  'Por definir',
  d::date,
  (SELECT id FROM new_tournament)
FROM (
  SELECT generate_series(
    '2026-03-07'::date,
    '2026-12-12'::date,
    '7 days'::interval
  ) AS d
) dates;
