-- Abilita estensione uuid
create extension if not exists "pgcrypto";

-- Tipi enum
create type tournament_format as enum ('round_robin', 'single_elim', 'mixed');
create type tournament_status as enum ('upcoming', 'in_progress', 'completed');
create type match_status as enum ('scheduled', 'in_progress', 'completed');
create type match_phase as enum ('girone', 'quarti', 'semifinale', 'finale', 'terzo_posto');

-- Profili utente (collegati a auth.users di Supabase)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Tornei
create table tournaments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  format tournament_format not null,
  status tournament_status not null default 'upcoming',
  description text,
  predictions_locked boolean not null default false,
  created_at timestamptz not null default now()
);

-- Squadre
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tournament_id uuid not null references tournaments(id) on delete cascade,
  group_name text,
  created_at timestamptz not null default now()
);

-- Partite
create table matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  phase match_phase not null,
  round int not null default 1,
  team_home_id uuid references teams(id) on delete set null,
  team_away_id uuid references teams(id) on delete set null,
  score_home int,
  score_away int,
  scheduled_at timestamptz not null,
  status match_status not null default 'scheduled',
  court text
);

-- Pronostici partite
create table predictions_match (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  predicted_home int not null check (predicted_home in (0, 1, 2)),
  predicted_away int not null check (predicted_away in (0, 1, 2)),
  points_awarded int,
  submitted_at timestamptz not null default now(),
  unique(user_id, match_id)
);

-- Pronostici vincitori torneo
create table predictions_winner (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  tournament_id uuid not null references tournaments(id) on delete cascade,
  predicted_team_id uuid not null references teams(id) on delete cascade,
  points_awarded int,
  submitted_at timestamptz not null default now(),
  unique(user_id, tournament_id)
);

-- Row Level Security
alter table users enable row level security;
alter table tournaments enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;
alter table predictions_match enable row level security;
alter table predictions_winner enable row level security;

-- Policy: lettura pubblica su tornei, squadre, partite
create policy "public read tournaments" on tournaments for select using (true);
create policy "public read teams" on teams for select using (true);
create policy "public read matches" on matches for select using (true);

-- Policy: utenti vedono solo i propri pronostici
create policy "users read own predictions" on predictions_match for select using (auth.uid() = user_id);
create policy "users insert own predictions" on predictions_match for insert with check (auth.uid() = user_id);
create policy "users update own predictions" on predictions_match for update using (auth.uid() = user_id);

create policy "users read own winner predictions" on predictions_winner for select using (auth.uid() = user_id);
create policy "users insert own winner predictions" on predictions_winner for insert with check (auth.uid() = user_id);
create policy "users update own winner predictions" on predictions_winner for update using (auth.uid() = user_id);

-- Policy: admin può tutto
create policy "admin full access matches" on matches using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);

-- Auto-creazione profilo utente dopo registrazione
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
