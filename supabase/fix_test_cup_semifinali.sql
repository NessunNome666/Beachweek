-- fix_test_cup_semifinali.sql
-- Da eseguire UNA VOLTA SOLA su Supabase SQL Editor, DOPO aver eseguito
-- 008_fix_bracket_position_ordering.sql.
--
-- Corregge i dati del torneo "Test Cup 2026" già corrotti dal bug: entrambe
-- le semifinali mostravano "Juventus FC vs AC Milan" invece che la prima
-- semifinale fosse "Napoli SC vs AS Roma" (vincitrici degli altri due quarti).
--
-- La partita coinvolta è quella con scheduled_at 2026-07-04 16:10 (la prima
-- delle due semifinali in ordine cronologico).

UPDATE matches m
SET team_home_id = (SELECT id FROM teams WHERE tournament_id = m.tournament_id AND name = 'Napoli SC'),
    team_away_id = (SELECT id FROM teams WHERE tournament_id = m.tournament_id AND name = 'AS Roma')
WHERE m.tournament_id = (SELECT id FROM tournaments WHERE name = 'Test Cup 2026')
  AND m.phase = 'semifinale'
  AND m.scheduled_at = '2026-07-04 16:10:00+00';

-- Verifica il risultato:
-- select phase, scheduled_at, team_home_id, team_away_id from matches
-- where tournament_id = (select id from tournaments where name = 'Test Cup 2026')
--   and phase = 'semifinale' order by scheduled_at;
