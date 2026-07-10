-- Migration 012: la classifica Fanta mostra solo utenti che hanno completato
-- almeno un accesso (2026-07-10, sera pre-evento).
--
-- Problema: Supabase crea l'utenza alla RICHIESTA del magic link, non al primo
-- accesso riuscito. Email sbagliate o tentativi abbandonati diventavano righe
-- fantasma in classifica (caso reale: utente mostrato due volte per i tentativi
-- falliti del flusso PKCE cross-browser, vedi commit da97144).
--
-- Fix: filtro su auth.users.email_confirmed_at, che viene valorizzato solo al
-- primo verify riuscito. Chi è loggato ce l'ha sempre → nessun utente reale
-- sparisce; i fantasmi (che non possono nemmeno accedere) non compaiono più.
-- La view è già SECURITY DEFINER (011): il proprietario postgres può leggere
-- auth.users, i client no — nessun nuovo permesso esposto.
--
-- CREATE OR REPLACE è valido: stesse colonne, stesso ordine (regola: mai
-- cambiare ordine/nomi colonne di una view senza DROP+CREATE).

CREATE OR REPLACE VIEW public.fanta_leaderboard AS
WITH match_pts AS (
  SELECT predictions_match.user_id,
    sum(COALESCE(predictions_match.points_awarded, 0)) AS match_points,
    count(CASE WHEN predictions_match.points_awarded = 3 THEN 1 ELSE NULL::integer END) AS correct_exact,
    count(CASE WHEN predictions_match.points_awarded >= 1 THEN 1 ELSE NULL::integer END) AS correct_winner
  FROM predictions_match
  GROUP BY predictions_match.user_id
), winner_pts AS (
  SELECT predictions_winner.user_id,
    sum(COALESCE(predictions_winner.points_awarded, 0)) AS winner_points
  FROM predictions_winner
  GROUP BY predictions_winner.user_id
)
SELECT u.id AS user_id,
  u.display_name,
  COALESCE(mp.match_points, 0::bigint)::integer AS match_points,
  COALESCE(wp.winner_points, 0::bigint)::integer AS winner_points,
  (COALESCE(mp.match_points, 0::bigint) + COALESCE(wp.winner_points, 0::bigint))::integer AS total_points,
  COALESCE(mp.correct_exact, 0::bigint)::integer AS correct_exact,
  COALESCE(mp.correct_winner, 0::bigint)::integer AS correct_winner
FROM users u
  JOIN auth.users au ON au.id = u.id
  LEFT JOIN match_pts mp ON mp.user_id = u.id
  LEFT JOIN winner_pts wp ON wp.user_id = u.id
WHERE au.email_confirmed_at IS NOT NULL
ORDER BY ((COALESCE(mp.match_points, 0::bigint) + COALESCE(wp.winner_points, 0::bigint))::integer) DESC;

-- CREATE OR REPLACE può non preservare le opzioni: ri-fisso il comportamento
-- definer della 011 (idempotente; i GRANT invece sopravvivono al replace).
ALTER VIEW public.fanta_leaderboard SET (security_invoker = false);
