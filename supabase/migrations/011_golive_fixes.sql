-- Migration 011: fix pre-go-live (macro-revisione 2026-07-09)
-- Eseguire manualmente nell'SQL Editor di Supabase. Tutto idempotente.

-- ────────────────────────────────────────────────────────────────────
-- 1. BUG: punti fanta non ricalcolati sulla correzione di un risultato
--    Il trigger scattava solo alla PRIMA chiusura (old.status <> 'completed').
--    Se l'admin corregge un risultato già salvato lo stato resta 'completed',
--    il trigger non riparte e i punti fanta restano sul punteggio sbagliato
--    (la classifica gironi si auto-corregge perché è una view; la Fanta no).
--    La funzione riscrive da zero i punti di tutti i pronostici della partita:
--    eseguirla più volte dà sempre lo stesso risultato.
-- ────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_match_completed ON matches;
CREATE TRIGGER on_match_completed
  AFTER UPDATE OF status, score_home, score_away ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'completed'
        AND NEW.score_home IS NOT NULL
        AND NEW.score_away IS NOT NULL)
  EXECUTE FUNCTION calculate_match_prediction_points();

-- NOTA: advance_bracket (eliminazione) resta volutamente "solo prima chiusura":
-- ri-propagare un vincitore corretto sovrascriverebbe slot già giocati.
-- Correzioni di tabellone vanno fatte a mano (vedi dossier §05).

-- ────────────────────────────────────────────────────────────────────
-- 2. Privacy / fair-play: chiudere l'esposizione di email e pronostici
--    Le tre policy "readable_by_authenticated" servivano solo alla view
--    fanta_leaderboard (security_invoker=true). Effetto collaterale: ogni
--    utente loggato poteva leggere via API i pronostici altrui (anche su
--    partite future) e l'email di ogni iscritto.
--    Fix: la view gira coi permessi del proprietario (espone SOLO
--    display_name + punti aggregati) e le policy larghe si eliminano.
--    Bonus: la classifica diventa visibile anche senza login.
--    Il linter Supabase segnalerà la view come "definer view": è voluto.
-- ────────────────────────────────────────────────────────────────────
ALTER VIEW public.fanta_leaderboard SET (security_invoker = false);
GRANT SELECT ON public.fanta_leaderboard TO anon, authenticated;

DROP POLICY IF EXISTS predictions_match_readable_by_authenticated  ON public.predictions_match;
DROP POLICY IF EXISTS predictions_winner_readable_by_authenticated ON public.predictions_winner;
DROP POLICY IF EXISTS users_readable_by_authenticated              ON public.users;

-- ────────────────────────────────────────────────────────────────────
-- 3. Integrità: funzioni-trigger non richiamabili come RPC pubbliche
--    (in teoria chiunque poteva chiamarle per forzare punti podio o
--    "chiudere" un torneo). I trigger continuano a funzionare: girano
--    coi permessi del proprietario della tabella, non del chiamante.
--    get_mvp_results NON va revocata: la chiama legittimamente il client.
-- ────────────────────────────────────────────────────────────────────
--    NB: serve revocare da PUBLIC — anon/authenticated ereditano l'EXECUTE
--    dal grant implicito a PUBLIC, revocarlo solo da loro non ha effetto.
REVOKE EXECUTE ON FUNCTION public.award_podium_points(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_tournament_when_podium_decided() FROM PUBLIC, anon, authenticated;

-- ────────────────────────────────────────────────────────────────────
-- 4. Indici di copertura sulle foreign key (avvisi del linter)
-- ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_matches_tournament  ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_home        ON matches(team_home_id);
CREATE INDEX IF NOT EXISTS idx_matches_away        ON matches(team_away_id);
CREATE INDEX IF NOT EXISTS idx_teams_tournament    ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_pmatch_match        ON predictions_match(match_id);
CREATE INDEX IF NOT EXISTS idx_pwin_tournament     ON predictions_winner(tournament_id);
CREATE INDEX IF NOT EXISTS idx_pwin_team           ON predictions_winner(predicted_team_id);
CREATE INDEX IF NOT EXISTS idx_mvpvotes_candidate  ON mvp_votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_mvpvotes_tournament ON mvp_votes(tournament_id);
CREATE INDEX IF NOT EXISTS idx_mvpcand_tournament  ON mvp_candidates(tournament_id);

-- ────────────────────────────────────────────────────────────────────
-- 5. search_path fisso sulle funzioni (hardening, avvisi del linter)
-- ────────────────────────────────────────────────────────────────────
ALTER FUNCTION public.calculate_winner_prediction_points()      SET search_path = public, pg_temp;
ALTER FUNCTION public.reset_mvp_notified()                      SET search_path = public, pg_temp;
ALTER FUNCTION public.advance_bracket()                         SET search_path = public, pg_temp;
ALTER FUNCTION public.award_podium_points(uuid)                 SET search_path = public, pg_temp;
ALTER FUNCTION public.complete_tournament_when_podium_decided() SET search_path = public, pg_temp;
