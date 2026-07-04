-- ════════════════════════════════════════════════════════════════════════════
-- IMPORT DATI REALI — Tito Beach Week 2026
-- ════════════════════════════════════════════════════════════════════════════
-- Da eseguire UNA VOLTA nell'SQL Editor di Supabase, quando i nomi reali
-- sono stati inseriti al posto dei segnaposto ⚠️ qui sotto.
--
-- Il database ha GIÀ tutta la struttura corretta (gironi, calendario,
-- tabellone eliminazione con round univoci): questo script NON ricrea nulla,
-- si limita a:
--   STEP 1 — eliminare il torneo di prova "Test Cup 2026"
--   STEP 2 — azzerare i pronostici di prova fatti sulle squadre segnaposto
--   STEP 3 — rinominare le 52 squadre segnaposto con i nomi reali
--   STEP 4 — assegnare accoppiamenti e orari reali alle 78 partite di girone
--            + orari eliminatorie (2 quarti FV da calendario, resto provvisorio)
--   STEP 5 — verifiche finali (annullano tutto se qualcosa non torna)
--
-- Tutto in un'unica transazione: o va tutto a buon fine, o non cambia nulla.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── STEP 1 — Elimina il torneo di prova ─────────────────────────────────────
-- Le foreign key sono ON DELETE CASCADE: squadre, partite, pronostici e
-- voti MVP della Test Cup spariscono automaticamente.
DELETE FROM tournaments WHERE slug = 'test-cup-2026';

-- ── STEP 2 — Azzera i pronostici di prova ───────────────────────────────────
-- I pronostici rimasti puntano a squadre segnaposto dei tornei reali:
-- sono test e vanno rimossi prima dell'evento.
DELETE FROM predictions_match;
DELETE FROM predictions_winner;

-- ── STEP 3 — Nomi reali delle squadre ───────────────────────────────────────
-- Sostituire ogni '⚠️ ...' con il nome reale. NON cambiare la colonna di
-- sinistra (segnaposto) né l'ordine: la posizione nel girone determina il
-- calendario (chi gioca contro chi in ogni turno).

-- Fonte di tutti i nomi: "GIRONI 2026.pdf" (2026-07-04). I gironi hanno nomi
-- reali che vengono scritti anche in group_name. L'ordine dei gironi segue la
-- locandina (riga per riga); l'ordine delle squadre nel girone segue l'elenco.
-- Se il calendario reale prevede accoppiamenti diversi per turno,
-- riordinare gli slot 1-4 dentro il girone.

-- Beach Volley 4v4 Amatoriale — 7 gironi × 4 squadre
-- Tema: Mondiali di pallavolo vinti dall'Italia
UPDATE teams t SET name = v.nome_reale, group_name = v.girone
FROM (VALUES
  -- Girone A → BRASILE '90
  ('Squadra A1', 'TENUTA CARUSO (le riserve)',  'BRASILE ''90'),
  ('Squadra A2', 'GLI STELLOSCOPICI',           'BRASILE ''90'),
  ('Squadra A3', 'SAND STORM',                  'BRASILE ''90'),
  ('Squadra A4', 'KISS MY ASSS',                'BRASILE ''90'),
  -- Girone B → GERMANIA '02
  ('Squadra B1', 'DYNAMIKA',                    'GERMANIA ''02'),
  ('Squadra B2', 'CORTO MUSO',                  'GERMANIA ''02'),
  ('Squadra B3', 'MARESCIALLO NON CI PRENDI',   'GERMANIA ''02'),
  ('Squadra B4', 'TENUTA CARUSO DREAM TEAM',    'GERMANIA ''02'),
  -- Girone C → GRECIA '94
  ('Squadra C1', 'STANCHI NOI',                 'GRECIA ''94'),
  ('Squadra C2', '3 UOMINI E 1 DONNA',          'GRECIA ''94'),
  ('Squadra C3', 'POTENZA DENUNCIA',            'GRECIA ''94'),
  ('Squadra C4', 'D&P INSTALLAZIONI',           'GRECIA ''94'),
  -- Girone D → BRASILE '10
  ('Squadra D1', 'ACCSCI FORT',                 'BRASILE ''10'),
  ('Squadra D2', 'LAURENZANA 2.0',              'BRASILE ''10'),
  ('Squadra D3', 'FENICOTTERI ROSA',            'BRASILE ''10'),
  ('Squadra D4', 'GLI IMPROBABILI',             'BRASILE ''10'),
  -- Girone E → GIAPPONE '98
  ('Squadra E1', 'LI COMMODI(NI)',              'GIAPPONE ''98'),
  ('Squadra E2', 'EMAN CIPATI',                 'GIAPPONE ''98'),
  ('Squadra E3', 'I CONFUSI',                   'GIAPPONE ''98'),
  ('Squadra E4', 'GLI SCHIACCIATI DI CASA',     'GIAPPONE ''98'),
  -- Girone F → POLONIA '22
  ('Squadra F1', 'AVIS',                        'POLONIA ''22'),
  ('Squadra F2', 'GIO DONATI',                  'POLONIA ''22'),
  ('Squadra F3', 'LE CENTRIFUGATE',             'POLONIA ''22'),
  ('Squadra F4', 'SENZA FIATO',                 'POLONIA ''22'),
  -- Girone G → THAILANDIA '25 (etichetta troncata nel PDF, anno confermato dall'utente)
  ('Squadra G1', 'DISASTRO TOTALE',             'THAILANDIA ''25'),
  ('Squadra G2', 'EDIL SALVIA',                 'THAILANDIA ''25'),
  ('Squadra G3', 'DIFETTI DI FABBRICA',         'THAILANDIA ''25'),
  ('Squadra G4', 'LA BOTTEGA DEL QUARTIERE',    'THAILANDIA ''25')
) AS v(segnaposto, nome_reale, girone)
WHERE t.name = v.segnaposto
  AND t.tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

-- Beach Volley 4v4 Pro — 2 gironi × 4 squadre
-- Tema: CT leggendari della nazionale italiana di volley
UPDATE teams t SET name = v.nome_reale, group_name = v.girone
FROM (VALUES
  -- Girone A → DE GIORGI
  ('Pro A1', 'I NOVASIRESI',           'DE GIORGI'),
  ('Pro A2', 'I SUDDITI DI TRIPLA T',  'DE GIORGI'),
  ('Pro A3', 'A'' T''NIT NA CASA',     'DE GIORGI'),
  ('Pro A4', 'BURGER GRILL',           'DE GIORGI'),
  -- Girone B → VELASCO
  ('Pro B1', 'TRA ALTI E BASSI',       'VELASCO'),
  ('Pro B2', 'SABBIA NELLE MUTANDE',   'VELASCO'),
  ('Pro B3', 'T''NIA NA VIGNA',        'VELASCO'),
  -- "RENZO" nel PDF gironi era un segnaposto: nome reale confermato dall'utente
  ('Pro B4', 'BUBU VOLLEY',            'VELASCO')
) AS v(segnaposto, nome_reale, girone)
WHERE t.name = v.segnaposto
  AND t.tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-pro');

-- Foot Volley 2v2 — 4 gironi × 4 squadre
-- Tema: Mondiali di calcio vinti dall'Italia
UPDATE teams t SET name = v.nome_reale, group_name = v.girone
FROM (VALUES
  -- Girone A → ITALIA '34
  ('FV A1', 'FC PORCELLONA',               'ITALIA ''34'),
  ('FV A2', 'B and b',                     'ITALIA ''34'),
  ('FV A3', 'LA BOTTEGA DEL QUARTIERE',    'ITALIA ''34'),
  ('FV A4', 'EDICOLA LAURINO',             'ITALIA ''34'),
  -- Girone B → FRANCIA '38
  ('FV B1', 'PANIFICIO ARTE BIANCA',       'FRANCIA ''38'),
  ('FV B2', 'RYUJIN',                      'FRANCIA ''38'),
  ('FV B3', 'PALA E PICU',                 'FRANCIA ''38'),
  ('FV B4', 'CRUNCH PIZZERIA ROSTICCERIA', 'FRANCIA ''38'),
  -- Girone C → SPAGNA '82
  ('FV C1', 'MIRTILLO',                    'SPAGNA ''82'),
  ('FV C2', 'UNO DUE COMPÀ',               'SPAGNA ''82'),
  ('FV C3', 'FC ETTANERA',                 'SPAGNA ''82'),
  ('FV C4', 'BURGER GRILL',                'SPAGNA ''82'),
  -- Girone D → GERMANIA '06
  ('FV D1', 'ASCARCI',                     'GERMANIA ''06'),
  ('FV D2', 'FERRAMENTA OSTUNI',           'GERMANIA ''06'),
  ('FV D3', 'CURAÇAO',                     'GERMANIA ''06'),
  ('FV D4', 'HASTA EL TERCER TIEMPO',      'GERMANIA ''06')
) AS v(segnaposto, nome_reale, girone)
WHERE t.name = v.segnaposto
  AND t.tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

-- ── STEP 4 — Calendario reale: accoppiamenti e orari ────────────────────────
-- Fonte: "CALENDARIO BEACH VOLLEY 2026 - CALENDARIO.csv" (2026-07-04).
-- Per ogni girone le 6 partite reali (in ordine cronologico, n = 1..6) vengono
-- assegnate alle 6 righe già esistenti in matches: così il "Round" mostrato
-- nell'app diventa la giornata del girone (1ª, 2ª, 3ª).
-- Orari con offset esplicito '+02' (ora italiana estiva). La partita delle
-- 00:00 di "sabato 11" è scritta come 12 luglio 00:00: l'app raggruppa le
-- giornate con confine alle 06:00, quindi resta sotto sabato 11.
-- ⚠️ NON modificare mai la colonna "round" delle partite a eliminazione:
--    determina la posizione nel tabellone (vedi migration 008).

-- Beach Volley 4v4 Amatoriale — 42 partite
WITH reali(girone, n, casa, ospite, orario) AS (VALUES
  -- BRASILE '90
  ('BRASILE ''90', 1, 'KISS MY ASSS',               'SAND STORM',                 '2026-07-11 21:30:00+02'),
  ('BRASILE ''90', 2, 'GLI STELLOSCOPICI',          'SAND STORM',                 '2026-07-12 19:30:00+02'),
  ('BRASILE ''90', 3, 'KISS MY ASSS',               'TENUTA CARUSO (le riserve)', '2026-07-12 23:00:00+02'),
  ('BRASILE ''90', 4, 'TENUTA CARUSO (le riserve)', 'GLI STELLOSCOPICI',          '2026-07-14 20:30:00+02'),
  ('BRASILE ''90', 5, 'TENUTA CARUSO (le riserve)', 'SAND STORM',                 '2026-07-14 23:30:00+02'),
  ('BRASILE ''90', 6, 'GLI STELLOSCOPICI',          'KISS MY ASSS',               '2026-07-17 22:00:00+02'),
  -- GERMANIA '02
  ('GERMANIA ''02', 1, 'CORTO MUSO',                'MARESCIALLO NON CI PRENDI',  '2026-07-11 23:30:00+02'),
  ('GERMANIA ''02', 2, 'TENUTA CARUSO DREAM TEAM',  'DYNAMIKA',                   '2026-07-12 20:00:00+02'),
  ('GERMANIA ''02', 3, 'TENUTA CARUSO DREAM TEAM',  'MARESCIALLO NON CI PRENDI',  '2026-07-13 23:00:00+02'),
  ('GERMANIA ''02', 4, 'DYNAMIKA',                  'CORTO MUSO',                 '2026-07-16 21:30:00+02'),
  ('GERMANIA ''02', 5, 'DYNAMIKA',                  'MARESCIALLO NON CI PRENDI',  '2026-07-16 23:00:00+02'),
  ('GERMANIA ''02', 6, 'TENUTA CARUSO DREAM TEAM',  'CORTO MUSO',                 '2026-07-17 23:00:00+02'),
  -- GRECIA '94
  ('GRECIA ''94', 1, '3 UOMINI E 1 DONNA',          'POTENZA DENUNCIA',           '2026-07-12 19:00:00+02'),
  ('GRECIA ''94', 2, 'D&P INSTALLAZIONI',           'POTENZA DENUNCIA',           '2026-07-12 21:30:00+02'),
  ('GRECIA ''94', 3, 'D&P INSTALLAZIONI',           '3 UOMINI E 1 DONNA',         '2026-07-13 22:00:00+02'),
  ('GRECIA ''94', 4, 'POTENZA DENUNCIA',            'STANCHI NOI',                '2026-07-15 20:30:00+02'),
  ('GRECIA ''94', 5, 'STANCHI NOI',                 'D&P INSTALLAZIONI',          '2026-07-15 22:00:00+02'),
  ('GRECIA ''94', 6, 'STANCHI NOI',                 '3 UOMINI E 1 DONNA',         '2026-07-17 20:30:00+02'),
  -- BRASILE '10
  ('BRASILE ''10', 1, 'GLI IMPROBABILI',            'LAURENZANA 2.0',             '2026-07-11 20:30:00+02'),
  ('BRASILE ''10', 2, 'LAURENZANA 2.0',             'FENICOTTERI ROSA',           '2026-07-12 22:30:00+02'),
  ('BRASILE ''10', 3, 'ACCSCI FORT',                'FENICOTTERI ROSA',           '2026-07-13 20:30:00+02'),
  ('BRASILE ''10', 4, 'ACCSCI FORT',                'LAURENZANA 2.0',             '2026-07-16 20:00:00+02'),
  ('BRASILE ''10', 5, 'GLI IMPROBABILI',            'ACCSCI FORT',                '2026-07-16 22:00:00+02'),
  ('BRASILE ''10', 6, 'GLI IMPROBABILI',            'FENICOTTERI ROSA',           '2026-07-17 21:00:00+02'),
  -- GIAPPONE '98
  ('GIAPPONE ''98', 1, 'EMAN CIPATI',               'GLI SCHIACCIATI DI CASA',    '2026-07-11 20:00:00+02'),
  ('GIAPPONE ''98', 2, 'I CONFUSI',                 'GLI SCHIACCIATI DI CASA',    '2026-07-13 20:00:00+02'),
  ('GIAPPONE ''98', 3, 'LI COMMODI(NI)',            'I CONFUSI',                  '2026-07-14 19:00:00+02'),
  ('GIAPPONE ''98', 4, 'LI COMMODI(NI)',            'GLI SCHIACCIATI DI CASA',    '2026-07-14 21:00:00+02'),
  ('GIAPPONE ''98', 5, 'EMAN CIPATI',               'LI COMMODI(NI)',             '2026-07-15 20:00:00+02'),
  ('GIAPPONE ''98', 6, 'I CONFUSI',                 'EMAN CIPATI',                '2026-07-17 19:00:00+02'),
  -- POLONIA '22
  ('POLONIA ''22', 1, 'AVIS',                       'SENZA FIATO',                '2026-07-12 22:00:00+02'),
  ('POLONIA ''22', 2, 'LE CENTRIFUGATE',            'SENZA FIATO',                '2026-07-13 19:30:00+02'),
  ('POLONIA ''22', 3, 'AVIS',                       'GIO DONATI',                 '2026-07-14 19:30:00+02'),
  ('POLONIA ''22', 4, 'GIO DONATI',                 'LE CENTRIFUGATE',            '2026-07-15 19:00:00+02'),
  ('POLONIA ''22', 5, 'GIO DONATI',                 'SENZA FIATO',                '2026-07-16 19:30:00+02'),
  ('POLONIA ''22', 6, 'AVIS',                       'LE CENTRIFUGATE',            '2026-07-16 21:00:00+02'),
  -- THAILANDIA '25
  ('THAILANDIA ''25', 1, 'EDIL SALVIA',             'DIFETTI DI FABBRICA',        '2026-07-13 21:00:00+02'),
  ('THAILANDIA ''25', 2, 'EDIL SALVIA',             'LA BOTTEGA DEL QUARTIERE',   '2026-07-14 23:00:00+02'),
  ('THAILANDIA ''25', 3, 'DISASTRO TOTALE',         'LA BOTTEGA DEL QUARTIERE',   '2026-07-15 21:30:00+02'),
  ('THAILANDIA ''25', 4, 'DISASTRO TOTALE',         'EDIL SALVIA',                '2026-07-15 23:00:00+02'),
  ('THAILANDIA ''25', 5, 'DIFETTI DI FABBRICA',     'LA BOTTEGA DEL QUARTIERE',   '2026-07-16 20:30:00+02'),
  ('THAILANDIA ''25', 6, 'DISASTRO TOTALE',         'DIFETTI DI FABBRICA',        '2026-07-16 22:30:00+02')
),
slot AS (
  SELECT m.id, th.group_name AS girone,
         ROW_NUMBER() OVER (PARTITION BY th.group_name ORDER BY m.round, m.id) AS n
  FROM matches m
  JOIN teams th ON th.id = m.team_home_id
  WHERE m.tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale')
    AND m.phase = 'girone'
)
UPDATE matches m
SET team_home_id = (SELECT t.id FROM teams t WHERE t.tournament_id = m.tournament_id AND t.name = r.casa),
    team_away_id = (SELECT t.id FROM teams t WHERE t.tournament_id = m.tournament_id AND t.name = r.ospite),
    scheduled_at = r.orario::timestamptz
FROM slot s
JOIN reali r ON r.girone = s.girone AND r.n = s.n
WHERE m.id = s.id;

-- Beach Volley 4v4 Pro — 12 partite
WITH reali(girone, n, casa, ospite, orario) AS (VALUES
  -- DE GIORGI
  ('DE GIORGI', 1, 'A'' T''NIT NA CASA',     'I SUDDITI DI TRIPLA T', '2026-07-11 22:00:00+02'),
  ('DE GIORGI', 2, 'I NOVASIRESI',           'BURGER GRILL',          '2026-07-12 21:00:00+02'),
  ('DE GIORGI', 3, 'I SUDDITI DI TRIPLA T',  'BURGER GRILL',          '2026-07-13 21:30:00+02'),
  ('DE GIORGI', 4, 'I NOVASIRESI',           'A'' T''NIT NA CASA',    '2026-07-13 22:30:00+02'),
  ('DE GIORGI', 5, 'A'' T''NIT NA CASA',     'BURGER GRILL',          '2026-07-14 22:30:00+02'),
  ('DE GIORGI', 6, 'I NOVASIRESI',           'I SUDDITI DI TRIPLA T', '2026-07-17 22:30:00+02'),
  -- VELASCO
  ('VELASCO', 1, 'T''NIA NA VIGNA',          'TRA ALTI E BASSI',      '2026-07-11 23:00:00+02'),
  ('VELASCO', 2, 'SABBIA NELLE MUTANDE',     'T''NIA NA VIGNA',       '2026-07-14 21:30:00+02'),
  ('VELASCO', 3, 'T''NIA NA VIGNA',          'BUBU VOLLEY',           '2026-07-15 21:00:00+02'),
  ('VELASCO', 4, 'SABBIA NELLE MUTANDE',     'BUBU VOLLEY',           '2026-07-15 22:30:00+02'),
  ('VELASCO', 5, 'TRA ALTI E BASSI',         'BUBU VOLLEY',           '2026-07-17 20:00:00+02'),
  ('VELASCO', 6, 'TRA ALTI E BASSI',         'SABBIA NELLE MUTANDE',  '2026-07-17 21:30:00+02')
),
slot AS (
  SELECT m.id, th.group_name AS girone,
         ROW_NUMBER() OVER (PARTITION BY th.group_name ORDER BY m.round, m.id) AS n
  FROM matches m
  JOIN teams th ON th.id = m.team_home_id
  WHERE m.tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-pro')
    AND m.phase = 'girone'
)
UPDATE matches m
SET team_home_id = (SELECT t.id FROM teams t WHERE t.tournament_id = m.tournament_id AND t.name = r.casa),
    team_away_id = (SELECT t.id FROM teams t WHERE t.tournament_id = m.tournament_id AND t.name = r.ospite),
    scheduled_at = r.orario::timestamptz
FROM slot s
JOIN reali r ON r.girone = s.girone AND r.n = s.n
WHERE m.id = s.id;

-- Foot Volley 2v2 — 24 partite
WITH reali(girone, n, casa, ospite, orario) AS (VALUES
  -- ITALIA '34
  ('ITALIA ''34', 1, 'LA BOTTEGA DEL QUARTIERE',       'EDICOLA LAURINO',            '2026-07-11 22:30:00+02'),
  ('ITALIA ''34', 2, 'B and b',                        'FC PORCELLONA',              '2026-07-12 00:00:00+02'),
  ('ITALIA ''34', 3, 'LA BOTTEGA DEL QUARTIERE',       'B and b',                    '2026-07-14 22:00:00+02'),
  ('ITALIA ''34', 4, 'LA BOTTEGA DEL QUARTIERE',       'FC PORCELLONA',              '2026-07-16 18:30:00+02'),
  ('ITALIA ''34', 5, 'EDICOLA LAURINO',                'FC PORCELLONA',              '2026-07-17 18:00:00+02'),
  ('ITALIA ''34', 6, 'B and b',                        'EDICOLA LAURINO',            '2026-07-17 19:30:00+02'),
  -- FRANCIA '38
  ('FRANCIA ''38', 1, 'PALA E PICU',                   'PANIFICIO ARTE BIANCA',      '2026-07-11 19:30:00+02'),
  ('FRANCIA ''38', 2, 'PANIFICIO ARTE BIANCA',         'RYUJIN',                     '2026-07-12 23:30:00+02'),
  ('FRANCIA ''38', 3, 'RYUJIN',                        'PALA E PICU',                '2026-07-13 23:30:00+02'),
  ('FRANCIA ''38', 4, 'CRUNCH PIZZERIA ROSTICCERIA',   'RYUJIN',                     '2026-07-14 18:00:00+02'),
  ('FRANCIA ''38', 5, 'CRUNCH PIZZERIA ROSTICCERIA',   'PALA E PICU',                '2026-07-14 20:00:00+02'),
  ('FRANCIA ''38', 6, 'CRUNCH PIZZERIA ROSTICCERIA',   'PANIFICIO ARTE BIANCA',      '2026-07-16 23:30:00+02'),
  -- SPAGNA '82
  ('SPAGNA ''82', 1, 'FC ETTANERA',                    'MIRTILLO',                   '2026-07-11 19:00:00+02'),
  ('SPAGNA ''82', 2, 'MIRTILLO',                       'BURGER GRILL',               '2026-07-12 18:30:00+02'),
  ('SPAGNA ''82', 3, 'UNO DUE COMPÀ',                  'BURGER GRILL',               '2026-07-13 19:00:00+02'),
  ('SPAGNA ''82', 4, 'FC ETTANERA',                    'UNO DUE COMPÀ',              '2026-07-14 18:30:00+02'),
  ('SPAGNA ''82', 5, 'MIRTILLO',                       'UNO DUE COMPÀ',              '2026-07-15 19:30:00+02'),
  ('SPAGNA ''82', 6, 'FC ETTANERA',                    'BURGER GRILL',               '2026-07-16 19:00:00+02'),
  -- GERMANIA '06
  ('GERMANIA ''06', 1, 'CURAÇAO',                      'HASTA EL TERCER TIEMPO',     '2026-07-11 21:00:00+02'),
  ('GERMANIA ''06', 2, 'FERRAMENTA OSTUNI',            'HASTA EL TERCER TIEMPO',     '2026-07-12 20:30:00+02'),
  ('GERMANIA ''06', 3, 'CURAÇAO',                      'FERRAMENTA OSTUNI',          '2026-07-13 18:30:00+02'),
  ('GERMANIA ''06', 4, 'ASCARCI',                      'HASTA EL TERCER TIEMPO',     '2026-07-15 18:30:00+02'),
  ('GERMANIA ''06', 5, 'ASCARCI',                      'FERRAMENTA OSTUNI',          '2026-07-15 23:30:00+02'),
  ('GERMANIA ''06', 6, 'CURAÇAO',                      'ASCARCI',                    '2026-07-17 18:30:00+02')
),
slot AS (
  SELECT m.id, th.group_name AS girone,
         ROW_NUMBER() OVER (PARTITION BY th.group_name ORDER BY m.round, m.id) AS n
  FROM matches m
  JOIN teams th ON th.id = m.team_home_id
  WHERE m.tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2')
    AND m.phase = 'girone'
)
UPDATE matches m
SET team_home_id = (SELECT t.id FROM teams t WHERE t.tournament_id = m.tournament_id AND t.name = r.casa),
    team_away_id = (SELECT t.id FROM teams t WHERE t.tournament_id = m.tournament_id AND t.name = r.ospite),
    scheduled_at = r.orario::timestamptz
FROM slot s
JOIN reali r ON r.girone = s.girone AND r.n = s.n
WHERE m.id = s.id;

-- Fase a eliminazione ───────────────────────────────────────────────────────
-- Dal calendario: "venerdì 17, a seguire due quarti di foot volley".
UPDATE matches m SET scheduled_at = '2026-07-17 23:30:00+02'
FROM tournaments t WHERE t.id = m.tournament_id
  AND t.slug = 'foot-volley-2v2' AND m.phase = 'quarti' AND m.round = 1;
UPDATE matches m SET scheduled_at = '2026-07-18 00:15:00+02'
FROM tournaments t WHERE t.id = m.tournament_id
  AND t.slug = 'foot-volley-2v2' AND m.phase = 'quarti' AND m.round = 2;

-- ⚠️ ORARI PROVVISORI: il programma reale di sabato 18 e domenica 19 non è
-- ancora stato comunicato. Questi valori servono solo a spostare le partite
-- sui giorni giusti (le TBD non compaiono al pubblico finché non hanno
-- squadre); l'admin può correggerli da /admin/calendario o con un nuovo script.
UPDATE matches m SET scheduled_at = v.orario::timestamptz
FROM tournaments t,
(VALUES
  ('beach-volley-amatoriale', 'ottavi',      NULL::int, '2026-07-18 18:00:00+02'),
  ('beach-volley-pro',        'quarti',      NULL,      '2026-07-18 21:00:00+02'),
  ('foot-volley-2v2',         'quarti',      3,         '2026-07-18 23:00:00+02'),
  ('foot-volley-2v2',         'quarti',      4,         '2026-07-18 23:45:00+02'),
  ('beach-volley-amatoriale', 'quarti',      NULL,      '2026-07-19 16:00:00+02'),
  ('foot-volley-2v2',         'semifinale',  NULL,      '2026-07-19 17:00:00+02'),
  ('beach-volley-amatoriale', 'semifinale',  NULL,      '2026-07-19 18:30:00+02'),
  ('beach-volley-pro',        'semifinale',  NULL,      '2026-07-19 19:30:00+02'),
  ('foot-volley-2v2',         'terzo_posto', NULL,      '2026-07-19 20:00:00+02'),
  ('beach-volley-amatoriale', 'terzo_posto', NULL,      '2026-07-19 20:30:00+02'),
  ('beach-volley-pro',        'terzo_posto', NULL,      '2026-07-19 21:00:00+02'),
  ('foot-volley-2v2',         'finale',      NULL,      '2026-07-19 21:30:00+02'),
  ('beach-volley-amatoriale', 'finale',      NULL,      '2026-07-19 22:00:00+02'),
  ('beach-volley-pro',        'finale',      NULL,      '2026-07-19 22:45:00+02')
) AS v(slug, fase, rnd, orario)
WHERE t.slug = v.slug AND m.tournament_id = t.id AND m.phase = v.fase
  AND (v.rnd IS NULL OR m.round = v.rnd);

-- ── STEP 5 — Verifica ───────────────────────────────────────────────────────
-- Se una qualsiasi verifica fallisce, l'intera transazione viene annullata.
DO $$
DECLARE n INT;
BEGIN
  -- Nessun segnaposto rimasto (né nei nomi squadra né nei nomi girone)
  SELECT count(*) INTO n FROM teams
  WHERE name LIKE 'Squadra %' OR name LIKE 'Pro A%' OR name LIKE 'Pro B%'
     OR name LIKE 'FV %' OR name LIKE '%⚠️%'
     OR group_name LIKE 'Girone %';
  IF n > 0 THEN
    RAISE EXCEPTION 'Ci sono ancora % squadre con nome o girone segnaposto', n;
  END IF;

  -- Nessuna partita di girone senza squadre (un refuso nei nomi dello STEP 4
  -- farebbe fallire la lookup e lascerebbe il campo NULL)
  SELECT count(*) INTO n FROM matches
  WHERE phase = 'girone' AND (team_home_id IS NULL OR team_away_id IS NULL);
  IF n > 0 THEN
    RAISE EXCEPTION '% partite di girone senza squadre assegnate: refuso nei nomi dello STEP 4', n;
  END IF;

  -- Ogni squadra deve giocare esattamente 3 partite di girone
  SELECT count(*) INTO n FROM (
    SELECT te.id
    FROM teams te
    LEFT JOIN matches m ON m.phase = 'girone'
      AND (m.team_home_id = te.id OR m.team_away_id = te.id)
    GROUP BY te.id
    HAVING count(m.id) <> 3
  ) sbagliate;
  IF n > 0 THEN
    RAISE EXCEPTION '% squadre non hanno esattamente 3 partite di girone', n;
  END IF;
END $$;

COMMIT;

-- ── Controlli post-import (facoltativi, da eseguire dopo il COMMIT) ─────────
-- Tornei e conteggi attesi: 3 tornei / 28+8+16 squadre / 58+20+32 partite
-- SELECT t.slug,
--        (SELECT count(*) FROM teams te WHERE te.tournament_id = t.id) AS squadre,
--        (SELECT count(*) FROM matches m WHERE m.tournament_id = t.id) AS partite
-- FROM tournaments t ORDER BY t.slug;
--
-- Calendario completo con i nomi reali:
-- SELECT t.slug, m.phase, m.round, th.name AS casa, ta.name AS ospite,
--        m.scheduled_at AT TIME ZONE 'Europe/Rome' AS orario_locale
-- FROM matches m
-- JOIN tournaments t ON t.id = m.tournament_id
-- LEFT JOIN teams th ON th.id = m.team_home_id
-- LEFT JOIN teams ta ON ta.id = m.team_away_id
-- ORDER BY m.scheduled_at, t.slug;
