-- seed_matches.sql
-- Esegui questo file su Supabase SQL Editor UNA VOLTA SOLA
-- su un database che ha già tornei e squadre (seed.sql già eseguito).
-- I nomi squadre sono placeholder: editali direttamente su Supabase > Table Editor > teams
-- oppure con una query UPDATE quando avrai i nomi reali.
--
-- Orari placeholder (UTC, equivalente CEST = UTC+2):
--   AMA Round 1: 11 lug 09:00 — Round 2: 12 lug 09:00 — Round 3: 13 lug 09:00
--   PRO Round 1: 11 lug 14:00 — Round 2: 12 lug 14:00 — Round 3: 13 lug 14:00
--   FV  Round 1: 14 lug 09:00 — Round 2: 15 lug 09:00 — Round 3: 16 lug 09:00
--   Eliminazioni: 15-19 lug (vedi sotto)
-- Tutti gli orari sono modificabili dall'admin in /admin/calendario

-- ─────────────────────────────────────────────────────────────────────────────
-- BEACH VOLLEY AMATORIALE
-- 7 gironi (A→G), 4 squadre/girone, round-robin 3 turni
-- Staggering orari: A,B 09:00 | C,D 10:30 | E,F 12:00 | G 13:30
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  tid UUID;
  grp  TEXT;
  t1   UUID; t2 UUID; t3 UUID; t4 UUID;
  c1   TEXT; c2 TEXT;
  toff INTERVAL;
  r1   TIMESTAMPTZ := '2026-07-11 07:00:00Z'; -- 09:00 CEST
  r2   TIMESTAMPTZ := '2026-07-12 07:00:00Z';
  r3   TIMESTAMPTZ := '2026-07-13 07:00:00Z';
BEGIN
  SELECT id INTO tid FROM tournaments WHERE slug = 'beach-volley-amatoriale';

  FOREACH grp IN ARRAY ARRAY['A','B','C','D','E','F','G'] LOOP
    SELECT id INTO t1 FROM teams WHERE tournament_id = tid AND name = 'Squadra ' || grp || '1';
    SELECT id INTO t2 FROM teams WHERE tournament_id = tid AND name = 'Squadra ' || grp || '2';
    SELECT id INTO t3 FROM teams WHERE tournament_id = tid AND name = 'Squadra ' || grp || '3';
    SELECT id INTO t4 FROM teams WHERE tournament_id = tid AND name = 'Squadra ' || grp || '4';

    CASE grp
      WHEN 'A' THEN c1 := 'Campo 1'; c2 := 'Campo 2'; toff := INTERVAL '0 minutes';
      WHEN 'B' THEN c1 := 'Campo 3'; c2 := 'Campo 4'; toff := INTERVAL '0 minutes';
      WHEN 'C' THEN c1 := 'Campo 1'; c2 := 'Campo 2'; toff := INTERVAL '90 minutes';
      WHEN 'D' THEN c1 := 'Campo 3'; c2 := 'Campo 4'; toff := INTERVAL '90 minutes';
      WHEN 'E' THEN c1 := 'Campo 1'; c2 := 'Campo 2'; toff := INTERVAL '180 minutes';
      WHEN 'F' THEN c1 := 'Campo 3'; c2 := 'Campo 4'; toff := INTERVAL '180 minutes';
      ELSE           c1 := 'Campo 1'; c2 := 'Campo 2'; toff := INTERVAL '270 minutes';
    END CASE;

    INSERT INTO matches (tournament_id, phase, round, team_home_id, team_away_id, scheduled_at, status, court) VALUES
      (tid, 'girone', 1, t1, t2, r1 + toff, 'scheduled', c1),
      (tid, 'girone', 1, t3, t4, r1 + toff, 'scheduled', c2);
    INSERT INTO matches (tournament_id, phase, round, team_home_id, team_away_id, scheduled_at, status, court) VALUES
      (tid, 'girone', 2, t1, t3, r2 + toff, 'scheduled', c1),
      (tid, 'girone', 2, t2, t4, r2 + toff, 'scheduled', c2);
    INSERT INTO matches (tournament_id, phase, round, team_home_id, team_away_id, scheduled_at, status, court) VALUES
      (tid, 'girone', 3, t1, t4, r3 + toff, 'scheduled', c1),
      (tid, 'girone', 3, t2, t3, r3 + toff, 'scheduled', c2);
  END LOOP;

  -- Quarti di finale — 8 partite (squadre TBD dopo gironi)
  INSERT INTO matches (tournament_id, phase, round, scheduled_at, status, court) VALUES
    (tid, 'quarti', 1, '2026-07-15 07:00:00Z', 'scheduled', 'Campo 1'),
    (tid, 'quarti', 2, '2026-07-15 07:00:00Z', 'scheduled', 'Campo 2'),
    (tid, 'quarti', 3, '2026-07-15 07:00:00Z', 'scheduled', 'Campo 3'),
    (tid, 'quarti', 4, '2026-07-15 07:00:00Z', 'scheduled', 'Campo 4'),
    (tid, 'quarti', 5, '2026-07-15 08:30:00Z', 'scheduled', 'Campo 1'),
    (tid, 'quarti', 6, '2026-07-15 08:30:00Z', 'scheduled', 'Campo 2'),
    (tid, 'quarti', 7, '2026-07-15 08:30:00Z', 'scheduled', 'Campo 3'),
    (tid, 'quarti', 8, '2026-07-15 08:30:00Z', 'scheduled', 'Campo 4');

  -- Semifinali — 4 partite il 17 lug
  INSERT INTO matches (tournament_id, phase, round, scheduled_at, status, court) VALUES
    (tid, 'semifinale', 1, '2026-07-17 07:00:00Z', 'scheduled', 'Campo 1'),
    (tid, 'semifinale', 2, '2026-07-17 07:00:00Z', 'scheduled', 'Campo 2'),
    (tid, 'semifinale', 3, '2026-07-17 07:00:00Z', 'scheduled', 'Campo 3'),
    (tid, 'semifinale', 4, '2026-07-17 07:00:00Z', 'scheduled', 'Campo 4');

  -- 3° posto + Finale il 19 lug
  INSERT INTO matches (tournament_id, phase, round, scheduled_at, status, court) VALUES
    (tid, 'terzo_posto', 1, '2026-07-19 08:00:00Z', 'scheduled', 'Campo 2'),
    (tid, 'finale',      1, '2026-07-19 14:00:00Z', 'scheduled', 'Campo 1');
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- BEACH VOLLEY PRO
-- 2 gironi (A,B), 4 squadre/girone — pomeriggio stessi giorni AMA
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  tid UUID;
  grp TEXT;
  t1 UUID; t2 UUID; t3 UUID; t4 UUID;
  c1 TEXT; c2 TEXT;
  r1 TIMESTAMPTZ := '2026-07-11 12:00:00Z'; -- 14:00 CEST
  r2 TIMESTAMPTZ := '2026-07-12 12:00:00Z';
  r3 TIMESTAMPTZ := '2026-07-13 12:00:00Z';
BEGIN
  SELECT id INTO tid FROM tournaments WHERE slug = 'beach-volley-pro';

  FOREACH grp IN ARRAY ARRAY['A','B'] LOOP
    SELECT id INTO t1 FROM teams WHERE tournament_id = tid AND name = 'Pro ' || grp || '1';
    SELECT id INTO t2 FROM teams WHERE tournament_id = tid AND name = 'Pro ' || grp || '2';
    SELECT id INTO t3 FROM teams WHERE tournament_id = tid AND name = 'Pro ' || grp || '3';
    SELECT id INTO t4 FROM teams WHERE tournament_id = tid AND name = 'Pro ' || grp || '4';

    IF grp = 'A' THEN c1 := 'Campo 1'; c2 := 'Campo 2';
    ELSE               c1 := 'Campo 3'; c2 := 'Campo 4'; END IF;

    INSERT INTO matches (tournament_id, phase, round, team_home_id, team_away_id, scheduled_at, status, court) VALUES
      (tid, 'girone', 1, t1, t2, r1, 'scheduled', c1),
      (tid, 'girone', 1, t3, t4, r1, 'scheduled', c2),
      (tid, 'girone', 2, t1, t3, r2, 'scheduled', c1),
      (tid, 'girone', 2, t2, t4, r2, 'scheduled', c2),
      (tid, 'girone', 3, t1, t4, r3, 'scheduled', c1),
      (tid, 'girone', 3, t2, t3, r3, 'scheduled', c2);
  END LOOP;

  -- Quarti — 4 partite il 16 lug pomeriggio
  INSERT INTO matches (tournament_id, phase, round, scheduled_at, status, court) VALUES
    (tid, 'quarti', 1, '2026-07-16 12:00:00Z', 'scheduled', 'Campo 1'),
    (tid, 'quarti', 2, '2026-07-16 12:00:00Z', 'scheduled', 'Campo 2'),
    (tid, 'quarti', 3, '2026-07-16 12:00:00Z', 'scheduled', 'Campo 3'),
    (tid, 'quarti', 4, '2026-07-16 12:00:00Z', 'scheduled', 'Campo 4');

  -- Semifinali il 18 lug mattina
  INSERT INTO matches (tournament_id, phase, round, scheduled_at, status, court) VALUES
    (tid, 'semifinale', 1, '2026-07-18 07:00:00Z', 'scheduled', 'Campo 1'),
    (tid, 'semifinale', 2, '2026-07-18 07:00:00Z', 'scheduled', 'Campo 2');

  -- 3° posto + Finale il 19 lug
  INSERT INTO matches (tournament_id, phase, round, scheduled_at, status, court) VALUES
    (tid, 'terzo_posto', 1, '2026-07-19 09:30:00Z', 'scheduled', 'Campo 3'),
    (tid, 'finale',      1, '2026-07-19 15:30:00Z', 'scheduled', 'Campo 1');
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FOOT VOLLEY 2v2
-- 4 gironi (A→D), 4 squadre/girone — giorni 14-16 lug
-- A,B ore 09:00 | C,D ore 10:30
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  tid UUID;
  grp TEXT;
  t1 UUID; t2 UUID; t3 UUID; t4 UUID;
  c1 TEXT; c2 TEXT;
  toff INTERVAL;
  r1 TIMESTAMPTZ := '2026-07-14 07:00:00Z'; -- 09:00 CEST
  r2 TIMESTAMPTZ := '2026-07-15 07:00:00Z';
  r3 TIMESTAMPTZ := '2026-07-16 07:00:00Z';
BEGIN
  SELECT id INTO tid FROM tournaments WHERE slug = 'foot-volley-2v2';

  FOREACH grp IN ARRAY ARRAY['A','B','C','D'] LOOP
    SELECT id INTO t1 FROM teams WHERE tournament_id = tid AND name = 'FV ' || grp || '1';
    SELECT id INTO t2 FROM teams WHERE tournament_id = tid AND name = 'FV ' || grp || '2';
    SELECT id INTO t3 FROM teams WHERE tournament_id = tid AND name = 'FV ' || grp || '3';
    SELECT id INTO t4 FROM teams WHERE tournament_id = tid AND name = 'FV ' || grp || '4';

    CASE grp
      WHEN 'A' THEN c1 := 'Campo 1'; c2 := 'Campo 2'; toff := INTERVAL '0 minutes';
      WHEN 'B' THEN c1 := 'Campo 3'; c2 := 'Campo 4'; toff := INTERVAL '0 minutes';
      WHEN 'C' THEN c1 := 'Campo 1'; c2 := 'Campo 2'; toff := INTERVAL '90 minutes';
      ELSE           c1 := 'Campo 3'; c2 := 'Campo 4'; toff := INTERVAL '90 minutes';
    END CASE;

    INSERT INTO matches (tournament_id, phase, round, team_home_id, team_away_id, scheduled_at, status, court) VALUES
      (tid, 'girone', 1, t1, t2, r1 + toff, 'scheduled', c1),
      (tid, 'girone', 1, t3, t4, r1 + toff, 'scheduled', c2),
      (tid, 'girone', 2, t1, t3, r2 + toff, 'scheduled', c1),
      (tid, 'girone', 2, t2, t4, r2 + toff, 'scheduled', c2),
      (tid, 'girone', 3, t1, t4, r3 + toff, 'scheduled', c1),
      (tid, 'girone', 3, t2, t3, r3 + toff, 'scheduled', c2);
  END LOOP;

  -- Quarti — 4 partite il 17 lug pomeriggio
  INSERT INTO matches (tournament_id, phase, round, scheduled_at, status, court) VALUES
    (tid, 'quarti', 1, '2026-07-17 12:00:00Z', 'scheduled', 'Campo 1'),
    (tid, 'quarti', 2, '2026-07-17 12:00:00Z', 'scheduled', 'Campo 2'),
    (tid, 'quarti', 3, '2026-07-17 12:00:00Z', 'scheduled', 'Campo 3'),
    (tid, 'quarti', 4, '2026-07-17 12:00:00Z', 'scheduled', 'Campo 4');

  -- Semifinali il 18 lug pomeriggio
  INSERT INTO matches (tournament_id, phase, round, scheduled_at, status, court) VALUES
    (tid, 'semifinale', 1, '2026-07-18 12:00:00Z', 'scheduled', 'Campo 3'),
    (tid, 'semifinale', 2, '2026-07-18 12:00:00Z', 'scheduled', 'Campo 4');

  -- 3° posto + Finale il 19 lug
  INSERT INTO matches (tournament_id, phase, round, scheduled_at, status, court) VALUES
    (tid, 'terzo_posto', 1, '2026-07-19 11:00:00Z', 'scheduled', 'Campo 4'),
    (tid, 'finale',      1, '2026-07-19 17:00:00Z', 'scheduled', 'Campo 2');
END $$;
