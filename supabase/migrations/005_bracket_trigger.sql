-- Migration 005: fase ottavi + trigger avanzamento bracket eliminazione
-- Eseguire manualmente su Supabase SQL Editor

-- 1. Aggiunge valore 'ottavi' all'enum match_phase
ALTER TYPE match_phase ADD VALUE IF NOT EXISTS 'ottavi';

-- 2. Trigger che propaga vincitore/perdente al turno successivo
--    Logica: le partite di ogni fase sono ordinate per scheduled_at.
--    La posizione determina quale slot del turno successivo riceve il vincitore.
--    ottavi pos 1→2 → quarti pos 1 (home/away)
--    ottavi pos 3→4 → quarti pos 2 (home/away)  ecc.
--    quarti pos 1→2 → semifinale pos 1 (home/away)
--    quarti pos 3→4 → semifinale pos 2 (home/away)
--    semifinale pos 1 → finale home + terzo_posto home
--    semifinale pos 2 → finale away + terzo_posto away

CREATE OR REPLACE FUNCTION advance_bracket()
RETURNS trigger AS $$
DECLARE
  winner_id  uuid;
  loser_id   uuid;
  my_pos     int;
  next_phase match_phase;
  target_pos int;
  fill_home  boolean;
BEGIN
  -- Esci subito per fasi non eliminatorie o match non completati
  IF new.status != 'completed'
     OR new.phase = 'girone'
     OR new.phase = 'finale'
     OR new.phase = 'terzo_posto'
  THEN
    RETURN new;
  END IF;

  winner_id := CASE WHEN new.score_home > new.score_away THEN new.team_home_id ELSE new.team_away_id END;
  loser_id  := CASE WHEN new.score_home > new.score_away THEN new.team_away_id ELSE new.team_home_id END;

  -- Posizione cronologica di questo match nella sua fase
  SELECT position INTO my_pos FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY scheduled_at) AS position
    FROM matches
    WHERE tournament_id = new.tournament_id AND phase = new.phase
  ) ranked WHERE id = new.id;

  IF new.phase = 'ottavi' THEN
    next_phase := 'quarti';
    target_pos := CEIL(my_pos::float / 2)::int;
    fill_home  := (my_pos % 2 = 1);

  ELSIF new.phase = 'quarti' THEN
    next_phase := 'semifinale';
    target_pos := CEIL(my_pos::float / 2)::int;
    fill_home  := (my_pos % 2 = 1);

  ELSIF new.phase = 'semifinale' THEN
    fill_home := (my_pos = 1);
    IF fill_home THEN
      UPDATE matches SET team_home_id = winner_id
        WHERE tournament_id = new.tournament_id AND phase = 'finale';
      UPDATE matches SET team_home_id = loser_id
        WHERE tournament_id = new.tournament_id AND phase = 'terzo_posto';
    ELSE
      UPDATE matches SET team_away_id = winner_id
        WHERE tournament_id = new.tournament_id AND phase = 'finale';
      UPDATE matches SET team_away_id = loser_id
        WHERE tournament_id = new.tournament_id AND phase = 'terzo_posto';
    END IF;
    RETURN new;
  END IF;

  -- Propaga vincitore al match successivo (ottavi→quarti o quarti→semifinale)
  UPDATE matches SET
    team_home_id = CASE WHEN fill_home     THEN winner_id ELSE team_home_id END,
    team_away_id = CASE WHEN NOT fill_home THEN winner_id ELSE team_away_id END
  WHERE tournament_id = new.tournament_id
    AND phase = next_phase
    AND id = (
      SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY scheduled_at) AS position
        FROM matches
        WHERE tournament_id = new.tournament_id AND phase = next_phase
      ) ranked WHERE position = target_pos
    );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_elimination_match_completed
  AFTER UPDATE OF status ON matches
  FOR EACH ROW
  WHEN (new.status = 'completed' AND old.status != 'completed')
  EXECUTE FUNCTION advance_bracket();
