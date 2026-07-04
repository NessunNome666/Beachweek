-- fix_amatoriale_bracket_structure.sql
-- Da eseguire UNA VOLTA SOLA su Supabase SQL Editor, DOPO 008_fix_bracket_position_ordering.sql.
--
-- PROBLEMA: il torneo Amatoriale (28 squadre, 16 qualificate all'eliminazione
-- diretta) ha bisogno di 4 turni: ottavi (8 partite) -> quarti (4 partite) ->
-- semifinale (2 partite) -> finale. Nei dati attuali le 8 partite del round
-- da 16 squadre erano etichettate 'quarti' (invece di 'ottavi') e le 4 partite
-- del round da 8 squadre erano etichettate 'semifinale' (invece di 'quarti') —
-- la vera semifinale a 2 partite non esisteva, quindi il trigger di
-- avanzamento non avrebbe mai potuto produrre una finale valida.
--
-- Nessun risultato è ancora stato inserito per queste fasi: si può correggere
-- senza perdere nulla.

-- 1. Le attuali 8 partite 'quarti' sono in realtà gli ottavi (16 squadre)
UPDATE matches
SET phase = 'ottavi'
WHERE tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale')
  AND phase = 'quarti';

-- 2. Le attuali 4 partite 'semifinale' sono in realtà i quarti (8 squadre)
UPDATE matches
SET phase = 'quarti'
WHERE tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale')
  AND phase = 'semifinale';

-- 3. Aggiunge le 2 partite di vera semifinale (4 squadre), finora mancanti,
--    tra i quarti (17 lug) e la finale (19 lug)
INSERT INTO matches (tournament_id, phase, round, scheduled_at, status) VALUES
  ((SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale'), 'semifinale', 1, '2026-07-18 07:00:00Z', 'scheduled'),
  ((SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale'), 'semifinale', 2, '2026-07-18 08:30:00Z', 'scheduled');

-- Verifica il risultato:
-- select phase, round, scheduled_at, count(*) from matches
-- where tournament_id = (select id from tournaments where slug = 'beach-volley-amatoriale')
--   and phase in ('ottavi','quarti','semifinale','finale')
-- group by phase, round, scheduled_at order by phase, round;
