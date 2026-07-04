-- Migration 008: fix bug "stessa partita in entrambe le semifinali"
-- Eseguire manualmente su Supabase SQL Editor
--
-- PROBLEMA: advance_bracket() decideva a quale semifinale (o quarti/finale)
-- assegnare un vincitore guardando l'ORARIO (scheduled_at) delle partite.
-- Ma nei tornei reali più partite della stessa fase sono programmate
-- ESATTAMENTE allo stesso orario (giocano in contemporanea su campi diversi),
-- quindi l'ordinamento non era stabile e poteva scrivere lo stesso vincitore
-- in due partite del turno successivo, lasciandone un'altra vuota.
--
-- FIX: usare "round" al posto di "scheduled_at" per capire la posizione.
-- "round" è già un numero univoco assegnato a ogni partita ad eliminazione
-- diretta (visibile in admin come "Round N") e non viene mai toccato dal
-- calendario (AdminCalendarioForm modifica solo orario/stato/note).

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
  IF new.status != 'completed'
     OR new.phase = 'girone'
     OR new.phase = 'finale'
     OR new.phase = 'terzo_posto'
  THEN
    RETURN new;
  END IF;

  winner_id := CASE WHEN new.score_home > new.score_away THEN new.team_home_id ELSE new.team_away_id END;
  loser_id  := CASE WHEN new.score_home > new.score_away THEN new.team_away_id ELSE new.team_home_id END;

  SELECT position INTO my_pos FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY round, scheduled_at, id) AS position
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

  UPDATE matches SET
    team_home_id = CASE WHEN fill_home     THEN winner_id ELSE team_home_id END,
    team_away_id = CASE WHEN NOT fill_home THEN winner_id ELSE team_away_id END
  WHERE tournament_id = new.tournament_id
    AND phase = next_phase
    AND id = (
      SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY round, scheduled_at, id) AS position
        FROM matches
        WHERE tournament_id = new.tournament_id AND phase = next_phase
      ) ranked WHERE position = target_pos
    );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
