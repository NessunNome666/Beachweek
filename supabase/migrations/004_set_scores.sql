-- Migration 004: punteggi set individuali e aggiornamento classifica
-- Eseguire manualmente su Supabase SQL Editor

-- 1. Aggiunge colonna per i punteggi set (es. "21-15,21-10" o "21-15,18-21,15-10")
ALTER TABLE matches ADD COLUMN IF NOT EXISTS score_detail TEXT;

-- 2. Aggiorna standings_view aggiungendo punti_scored e punti_conceded
DROP VIEW IF EXISTS standings_view;
CREATE VIEW standings_view AS
WITH set_points AS (
  SELECT
    m.id AS match_id,
    t.id AS team_id,
    COALESCE((
      SELECT SUM(
        CASE
          WHEN m.team_home_id = t.id THEN split_part(s, '-', 1)::int
          ELSE split_part(s, '-', 2)::int
        END
      )
      FROM unnest(string_to_array(m.score_detail, ',')) AS s
    ), 0) AS points_scored,
    COALESCE((
      SELECT SUM(
        CASE
          WHEN m.team_home_id = t.id THEN split_part(s, '-', 2)::int
          ELSE split_part(s, '-', 1)::int
        END
      )
      FROM unnest(string_to_array(m.score_detail, ',')) AS s
    ), 0) AS points_conceded
  FROM teams t
  JOIN matches m ON (m.team_home_id = t.id OR m.team_away_id = t.id)
    AND m.phase = 'girone'
    AND m.status = 'completed'
    AND m.score_detail IS NOT NULL
)
SELECT
  m.tournament_id,
  t.id AS team_id,
  t.name AS team_name,
  t.group_name,
  COUNT(CASE WHEN m.status = 'completed' THEN 1 END)::int AS matches_played,
  COUNT(CASE WHEN m.status = 'completed' AND (
    (m.team_home_id = t.id AND m.score_home > m.score_away) OR
    (m.team_away_id = t.id AND m.score_away > m.score_home)
  ) THEN 1 END)::int AS wins,
  COUNT(CASE WHEN m.status = 'completed' AND (
    (m.team_home_id = t.id AND m.score_home < m.score_away) OR
    (m.team_away_id = t.id AND m.score_away < m.score_home)
  ) THEN 1 END)::int AS losses,
  COALESCE(SUM(CASE WHEN m.team_home_id = t.id AND m.status = 'completed' THEN m.score_home
                    WHEN m.team_away_id = t.id AND m.status = 'completed' THEN m.score_away
                    ELSE 0 END)::int, 0) AS sets_won,
  COALESCE(SUM(CASE WHEN m.team_home_id = t.id AND m.status = 'completed' THEN m.score_away
                    WHEN m.team_away_id = t.id AND m.status = 'completed' THEN m.score_home
                    ELSE 0 END)::int, 0) AS sets_lost,
  COALESCE(SUM(sp.points_scored), 0)::int AS points_scored,
  COALESCE(SUM(sp.points_conceded), 0)::int AS points_conceded,
  (COUNT(CASE WHEN m.status = 'completed' AND (
    (m.team_home_id = t.id AND m.score_home > m.score_away) OR
    (m.team_away_id = t.id AND m.score_away > m.score_home)
  ) THEN 1 END) * 3 +
  COUNT(CASE WHEN m.status = 'completed' AND (
    (m.team_home_id = t.id AND m.score_home < m.score_away) OR
    (m.team_away_id = t.id AND m.score_away < m.score_home)
  ) THEN 1 END))::int AS points
FROM teams t
LEFT JOIN matches m ON (m.team_home_id = t.id OR m.team_away_id = t.id)
  AND m.phase = 'girone'
LEFT JOIN set_points sp ON sp.match_id = m.id AND sp.team_id = t.id
GROUP BY m.tournament_id, t.id, t.name, t.group_name;

ALTER VIEW standings_view SET (security_invoker = true);

-- 3. Fix trigger vincitore: gestisce 1°, 2° e 3° posto
CREATE OR REPLACE FUNCTION calculate_winner_prediction_points()
RETURNS trigger AS $$
DECLARE
  first_id uuid;
  second_id uuid;
  third_id uuid;
BEGIN
  IF new.status = 'completed' THEN
    SELECT CASE WHEN m.score_home > m.score_away THEN m.team_home_id ELSE m.team_away_id END
    INTO first_id FROM matches m
    WHERE m.tournament_id = new.id AND m.phase = 'finale' AND m.status = 'completed' LIMIT 1;

    SELECT CASE WHEN m.score_home > m.score_away THEN m.team_away_id ELSE m.team_home_id END
    INTO second_id FROM matches m
    WHERE m.tournament_id = new.id AND m.phase = 'finale' AND m.status = 'completed' LIMIT 1;

    SELECT CASE WHEN m.score_home > m.score_away THEN m.team_home_id ELSE m.team_away_id END
    INTO third_id FROM matches m
    WHERE m.tournament_id = new.id AND m.phase = 'terzo_posto' AND m.status = 'completed' LIMIT 1;

    UPDATE predictions_winner
    SET points_awarded = CASE
      WHEN placement = 1 AND predicted_team_id = first_id THEN 5
      WHEN placement = 2 AND predicted_team_id = second_id THEN 5
      WHEN placement = 3 AND predicted_team_id = third_id THEN 5
      ELSE 0
    END
    WHERE tournament_id = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
