-- ════════════════════════════════════════════════════════════════════════
-- IMPORT ROSE — Tito Beach Week 2026
-- Da eseguire UNA VOLTA nell'SQL Editor dopo la migration 010_team_players.
--
-- TEMPLATE: le rose reali non sono ancora arrivate dagli organizzatori.
-- Quando arrivano, compilare una UPDATE per squadra come negli esempi sotto.
--
-- ⚠️ I nomi squadra NON sono unici tra i tornei (BURGER GRILL esiste in
--    Foot Volley e Pro, LA BOTTEGA DEL QUARTIERE in Foot Volley e
--    Amatoriale): ogni UPDATE è vincolata allo slug del torneo.
-- ⚠️ Il match su name è esatto (maiuscole/spazi: "B and b", "CURAÇAO"...).
-- ⚠️ Mai array vuoti (ARRAY[]::text[]): usare NULL oppure omettere la squadra.
--
-- Slug reali dei tornei:
--   beach-volley-amatoriale   Beach Volley 4v4 Amatoriale
--   beach-volley-pro          Beach Volley 4v4 Pro
--   foot-volley-2v2           Foot Volley 2v2
-- ════════════════════════════════════════════════════════════════════════
BEGIN;

-- ── Beach Volley 4v4 Amatoriale ──────────────────────────────────────────
-- UPDATE teams SET players = ARRAY['Nome Cognome', 'Nome Cognome', 'Nome Cognome', 'Nome Cognome']
-- WHERE name = 'NOME SQUADRA'
--   AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

-- ── Beach Volley 4v4 Pro ─────────────────────────────────────────────────
-- UPDATE teams SET players = ARRAY['Nome Cognome', 'Nome Cognome', 'Nome Cognome', 'Nome Cognome']
-- WHERE name = 'NOME SQUADRA'
--   AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-pro');

-- ── Foot Volley 2v2 ──────────────────────────────────────────────────────
-- UPDATE teams SET players = ARRAY['Nome Cognome', 'Nome Cognome']
-- WHERE name = 'NOME SQUADRA'
--   AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

-- ── Verifica: squadre ancora senza rosa, per torneo ──────────────────────
SELECT tr.slug,
       count(*) FILTER (WHERE tm.players IS NULL OR cardinality(tm.players) = 0) AS senza_rosa,
       count(*) AS totale
FROM teams tm JOIN tournaments tr ON tr.id = tm.tournament_id
GROUP BY tr.slug;

COMMIT;
