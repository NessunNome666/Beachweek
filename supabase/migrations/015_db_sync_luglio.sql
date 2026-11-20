-- 015: allineamento repo ↔ database di produzione
--
-- Queste modifiche sono GIÀ APPLICATE in produzione il 2026-07-03
-- (supabase_migrations: 20260703162753, 20260703162823, 20260703162956)
-- ma non erano mai state salvate nel repo. Il testo SQL è copiato da
-- supabase_migrations.schema_migrations. Non va rieseguito sul DB di
-- produzione: serve a ricreare lo stesso stato partendo dai file del repo.
-- (Le due fix di Spotted del 2026-07-14 sono invece già incluse in 014_spotted.sql.)


-- ── 1. Lock del podio per torneo (fix di 005_prediction_cutoff.sql) ─────────
-- Bug: la EXISTS conteneva `m.tournament_id = m.tournament_id` (sempre vero),
-- rendendo il lock del podio globale invece che per-torneo.
-- Fix: correlare la sottoquery al torneo del pronostico.

ALTER POLICY "users insert own winner predictions" ON public.predictions_winner
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM tournaments t
      WHERE t.id = predictions_winner.tournament_id AND t.predictions_locked = true
    )
    AND EXISTS (
      SELECT 1 FROM matches m
      WHERE m.tournament_id = predictions_winner.tournament_id
        AND m.phase = 'girone' AND m.status <> 'completed'
    )
  );

ALTER POLICY "users update own winner predictions" ON public.predictions_winner
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM tournaments t
      WHERE t.id = predictions_winner.tournament_id AND t.predictions_locked = true
    )
    AND EXISTS (
      SELECT 1 FROM matches m
      WHERE m.tournament_id = predictions_winner.tournament_id
        AND m.phase = 'girone' AND m.status <> 'completed'
    )
  );


-- ── 2. Email degli utenti non leggibile dai ruoli pubblici ──────────────────
-- La colonna email non è mai letta dal client (l'app usa auth.getUser().email).
-- Il REVOKE di sola colonna è inefficace se resta il GRANT SELECT di tabella:
-- si toglie il SELECT di tabella e lo si concede solo sulle colonne non
-- sensibili. email resta leggibile solo a service_role.

REVOKE SELECT ON public.users FROM anon, authenticated;
GRANT SELECT (id, display_name, is_admin, created_at) ON public.users TO anon, authenticated;
