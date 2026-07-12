-- Migration 013: classifica Fanta per giornata (premio giornaliero).
--
-- SECURITY DEFINER come fanta_leaderboard (011/012): i client non possono
-- leggere predictions_match altrui né auth.users; la view espone solo
-- display_name + punti aggregati per giornata.
--
-- Confine giornata = 06:00 Europe/Rome, identico a src/lib/game-date.ts
-- (toGameDate: istante - 6h, formattato come data in Europe/Rome), così le
-- partite dopo mezzanotte contano nella giornata precedente.
--
-- ESCLUSI i punti podio (predictions_winner): sono a livello evento e
-- falserebbero il premio dell'ultima giornata.
--
-- Solo partite completed: le giornate future non compaiono (niente righe a
-- zero). Chi ha pronosticato ma sbagliato appare con 0 punti (ha partecipato);
-- chi non ha pronosticato quel giorno è assente.

CREATE VIEW public.fanta_leaderboard_daily AS
SELECT
  u.id AS user_id,
  u.display_name,
  ((m.scheduled_at - interval '6 hours') AT TIME ZONE 'Europe/Rome')::date AS game_date,
  sum(COALESCE(pm.points_awarded, 0))::integer AS day_points,
  count(*) FILTER (WHERE pm.points_awarded = 3)::integer AS correct_exact,
  count(*) FILTER (WHERE pm.points_awarded >= 1)::integer AS correct_winner
FROM predictions_match pm
JOIN matches m      ON m.id = pm.match_id
JOIN public.users u ON u.id = pm.user_id
JOIN auth.users au  ON au.id = u.id
WHERE m.status = 'completed'
  AND au.email_confirmed_at IS NOT NULL
GROUP BY u.id, u.display_name,
         (((m.scheduled_at - interval '6 hours') AT TIME ZONE 'Europe/Rome')::date)
ORDER BY game_date, day_points DESC, correct_exact DESC;

-- Stesso pattern di 011/012: comportamento definer esplicito (l'advisor la
-- segnalerà come le altre view definer: è voluto) + grant di lettura, la
-- classifica è pubblica anche senza login.
ALTER VIEW public.fanta_leaderboard_daily SET (security_invoker = false);
GRANT SELECT ON public.fanta_leaderboard_daily TO anon, authenticated;
