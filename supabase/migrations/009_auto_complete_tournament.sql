-- Migration 009: assegnazione automatica dei punti podio
-- Eseguire manualmente su Supabase SQL Editor
--
-- PROBLEMA: i punti dei pronostici podio (predictions_winner) vengono calcolati
-- dal trigger on_tournament_completed, che scatta solo quando tournaments.status
-- passa a 'completed'. Ma NIENTE nell'app imposta mai quello stato: si può
-- completare ogni partita (finale compresa) e il torneo resta 'upcoming',
-- quindi i punti podio non vengono mai assegnati.
--
-- FIX: quando una partita di finale o terzo posto viene completata (o il suo
-- risultato viene corretto), se entrambe le partite decisive del torneo sono
-- completate il torneo viene marcato 'completed' automaticamente e i punti
-- podio vengono (ri)calcolati. Nessuna azione manuale richiesta all'admin.

-- 1. Funzione riutilizzabile e idempotente: (ri)calcola i punti podio di un torneo.
--    1° = vincitore finale, 2° = perdente finale, 3° = vincitore terzo posto.
CREATE OR REPLACE FUNCTION award_podium_points(t_id uuid)
RETURNS void AS $$
DECLARE
  first_id uuid;
  second_id uuid;
  third_id uuid;
BEGIN
  SELECT CASE WHEN m.score_home > m.score_away THEN m.team_home_id ELSE m.team_away_id END,
         CASE WHEN m.score_home > m.score_away THEN m.team_away_id ELSE m.team_home_id END
  INTO first_id, second_id
  FROM matches m
  WHERE m.tournament_id = t_id AND m.phase = 'finale' AND m.status = 'completed'
  LIMIT 1;

  SELECT CASE WHEN m.score_home > m.score_away THEN m.team_home_id ELSE m.team_away_id END
  INTO third_id
  FROM matches m
  WHERE m.tournament_id = t_id AND m.phase = 'terzo_posto' AND m.status = 'completed'
  LIMIT 1;

  -- Senza finale completata non c'è podio da premiare
  IF first_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE predictions_winner
  SET points_awarded = CASE
    WHEN placement = 1 AND predicted_team_id = first_id THEN 5
    WHEN placement = 2 AND predicted_team_id = second_id THEN 5
    WHEN placement = 3 AND predicted_team_id = third_id THEN 5
    ELSE 0
  END
  WHERE tournament_id = t_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Il trigger esistente sul torneo ora delega alla funzione condivisa
--    (comportamento invariato: scatta quando tournaments.status -> 'completed')
CREATE OR REPLACE FUNCTION calculate_winner_prediction_points()
RETURNS trigger AS $$
BEGIN
  IF new.status = 'completed' THEN
    PERFORM award_podium_points(new.id);
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Nuovo trigger sulle partite decisive: completa il torneo da solo.
--    Scatta su QUALSIASI update di una finale/terzo posto completata, così
--    copre anche la correzione di un risultato a torneo già concluso.
CREATE OR REPLACE FUNCTION complete_tournament_when_podium_decided()
RETURNS trigger AS $$
BEGIN
  -- Tutte le partite decisive (finale + eventuale terzo posto) completate?
  IF EXISTS (
    SELECT 1 FROM matches m
    WHERE m.tournament_id = new.tournament_id
      AND m.phase IN ('finale', 'terzo_posto')
      AND m.status <> 'completed'
  ) THEN
    RETURN new;
  END IF;

  -- Prima conclusione: il cambio stato fa scattare on_tournament_completed
  UPDATE tournaments
  SET status = 'completed'
  WHERE id = new.tournament_id AND status <> 'completed';

  -- Correzione risultato a torneo già concluso (o ridondante ma innocuo
  -- alla prima conclusione, la funzione è idempotente): ricalcola i punti
  PERFORM award_podium_points(new.tournament_id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_podium_match_completed ON matches;
CREATE TRIGGER on_podium_match_completed
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (new.status = 'completed' AND new.phase IN ('finale', 'terzo_posto'))
  EXECUTE FUNCTION complete_tournament_when_podium_decided();

-- 4. Backfill: completa (e premia) eventuali tornei già decisi nel DB.
--    No-op se nessun torneo ha finale e terzo posto già completati.
UPDATE tournaments t
SET status = 'completed'
WHERE t.status <> 'completed'
  AND EXISTS (
    SELECT 1 FROM matches m
    WHERE m.tournament_id = t.id AND m.phase = 'finale' AND m.status = 'completed'
  )
  AND NOT EXISTS (
    SELECT 1 FROM matches m
    WHERE m.tournament_id = t.id
      AND m.phase IN ('finale', 'terzo_posto')
      AND m.status <> 'completed'
  );
