-- Seed: sostituire i nomi placeholder con quelli reali prima dell'evento.

-- ── TORNEI ──────────────────────────────────────────────────
insert into tournaments (slug, name, format, status, description) values
  ('beach-volley-amatoriale', 'Beach Volley 4v4 Amatoriale', 'mixed', 'upcoming',
   '28 squadre, 7 gironi. Le migliori 16 accedono al tabellone finale.'),
  ('beach-volley-pro',        'Beach Volley 4v4 Pro',        'mixed', 'upcoming',
   '8 squadre, 2 gironi. Tutte ai quarti di finale con accoppiamenti incrociati.'),
  ('foot-volley-2v2',         'Foot Volley 2v2',             'mixed', 'upcoming',
   '16 squadre, 4 gironi. Le prime 2 per girone accedono ai quarti.');

-- ── BEACH VOLLEY AMATORIALE — 7 gironi × 4 squadre ──────────
do $$
declare tid uuid := (select id from tournaments where slug = 'beach-volley-amatoriale');
begin
  -- Girone A
  insert into teams (name, tournament_id, group_name) values
    ('Squadra A1', tid, 'Girone A'), ('Squadra A2', tid, 'Girone A'),
    ('Squadra A3', tid, 'Girone A'), ('Squadra A4', tid, 'Girone A');
  -- Girone B
  insert into teams (name, tournament_id, group_name) values
    ('Squadra B1', tid, 'Girone B'), ('Squadra B2', tid, 'Girone B'),
    ('Squadra B3', tid, 'Girone B'), ('Squadra B4', tid, 'Girone B');
  -- Girone C
  insert into teams (name, tournament_id, group_name) values
    ('Squadra C1', tid, 'Girone C'), ('Squadra C2', tid, 'Girone C'),
    ('Squadra C3', tid, 'Girone C'), ('Squadra C4', tid, 'Girone C');
  -- Girone D
  insert into teams (name, tournament_id, group_name) values
    ('Squadra D1', tid, 'Girone D'), ('Squadra D2', tid, 'Girone D'),
    ('Squadra D3', tid, 'Girone D'), ('Squadra D4', tid, 'Girone D');
  -- Girone E
  insert into teams (name, tournament_id, group_name) values
    ('Squadra E1', tid, 'Girone E'), ('Squadra E2', tid, 'Girone E'),
    ('Squadra E3', tid, 'Girone E'), ('Squadra E4', tid, 'Girone E');
  -- Girone F
  insert into teams (name, tournament_id, group_name) values
    ('Squadra F1', tid, 'Girone F'), ('Squadra F2', tid, 'Girone F'),
    ('Squadra F3', tid, 'Girone F'), ('Squadra F4', tid, 'Girone F');
  -- Girone G
  insert into teams (name, tournament_id, group_name) values
    ('Squadra G1', tid, 'Girone G'), ('Squadra G2', tid, 'Girone G'),
    ('Squadra G3', tid, 'Girone G'), ('Squadra G4', tid, 'Girone G');
end $$;

-- ── BEACH VOLLEY PRO — 2 gironi × 4 squadre ─────────────────
do $$
declare tid uuid := (select id from tournaments where slug = 'beach-volley-pro');
begin
  insert into teams (name, tournament_id, group_name) values
    ('Pro A1', tid, 'Girone A'), ('Pro A2', tid, 'Girone A'),
    ('Pro A3', tid, 'Girone A'), ('Pro A4', tid, 'Girone A'),
    ('Pro B1', tid, 'Girone B'), ('Pro B2', tid, 'Girone B'),
    ('Pro B3', tid, 'Girone B'), ('Pro B4', tid, 'Girone B');
end $$;

-- ── FOOT VOLLEY — 4 gironi × 4 squadre ──────────────────────
do $$
declare tid uuid := (select id from tournaments where slug = 'foot-volley-2v2');
begin
  insert into teams (name, tournament_id, group_name) values
    ('FV A1', tid, 'Girone A'), ('FV A2', tid, 'Girone A'),
    ('FV A3', tid, 'Girone A'), ('FV A4', tid, 'Girone A'),
    ('FV B1', tid, 'Girone B'), ('FV B2', tid, 'Girone B'),
    ('FV B3', tid, 'Girone B'), ('FV B4', tid, 'Girone B'),
    ('FV C1', tid, 'Girone C'), ('FV C2', tid, 'Girone C'),
    ('FV C3', tid, 'Girone C'), ('FV C4', tid, 'Girone C'),
    ('FV D1', tid, 'Girone D'), ('FV D2', tid, 'Girone D'),
    ('FV D3', tid, 'Girone D'), ('FV D4', tid, 'Girone D');
end $$;
