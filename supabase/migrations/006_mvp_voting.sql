-- Migration 006: votazione MVP (elezione popolare)
-- Eseguire manualmente su Supabase SQL Editor.
--
-- Funzionalità "sorpresa": l'admin inserisce dei candidati (solo nome) per un
-- torneo e apre la votazione. Gli utenti loggati votano UNA sola volta, in modo
-- irrevocabile, e vedono i risultati in percentuale solo DOPO aver votato.
-- Non c'entra col Fanta: nessun punto, non tocca fanta_leaderboard.
--
-- La colonna mvp_status è generica per torneo: si può testare sul torneo di prova
-- e, quando questo verrà eliminato o rimesso su 'hidden', la funzionalità torna
-- invisibile in attesa dell'apertura del Foot Volley.

-- ─────────────────────────────────────────────────────────────
-- STATO VOTAZIONE per torneo
--   hidden = invisibile (default, sorpresa)
--   open   = votazione attiva
--   closed = chiusa, risultati visibili a tutti (svelamento/premiazione)
-- ─────────────────────────────────────────────────────────────
alter table tournaments
  add column if not exists mvp_status text not null default 'hidden'
  check (mvp_status in ('hidden', 'open', 'closed'));

-- L'admin deve poter aggiornare mvp_status (finora tournaments era sola lettura pubblica)
drop policy if exists "admin update tournaments" on tournaments;
create policy "admin update tournaments" on tournaments
  for update
  using (exists (select 1 from users where id = auth.uid() and is_admin = true));

-- ─────────────────────────────────────────────────────────────
-- CANDIDATI MVP (solo nome)
-- ─────────────────────────────────────────────────────────────
create table if not exists mvp_candidates (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table mvp_candidates enable row level security;

create policy "public read mvp_candidates" on mvp_candidates for select using (true);

create policy "admin write mvp_candidates" on mvp_candidates
  using (exists (select 1 from users where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from users where id = auth.uid() and is_admin = true));

-- ─────────────────────────────────────────────────────────────
-- VOTI MVP (uno per utente per torneo, irrevocabile)
-- ─────────────────────────────────────────────────────────────
create table if not exists mvp_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  candidate_id uuid not null references mvp_candidates(id) on delete cascade,
  tournament_id uuid not null references tournaments(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, tournament_id)
);

alter table mvp_votes enable row level security;

-- L'utente vede solo il proprio voto (i conteggi passano dalla RPC qui sotto)
create policy "users read own mvp vote" on mvp_votes
  for select using (auth.uid() = user_id);

-- Inserimento consentito solo per sé e solo se la votazione di quel torneo è 'open'
create policy "users insert own mvp vote" on mvp_votes
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from tournaments t
      where t.id = tournament_id and t.mvp_status = 'open'
    )
    and exists (
      select 1 from mvp_candidates c
      where c.id = candidate_id and c.tournament_id = mvp_votes.tournament_id
    )
  );

-- Nessuna policy UPDATE/DELETE per gli utenti → voto irrevocabile.

-- ─────────────────────────────────────────────────────────────
-- RISULTATI: funzione security definer che applica la regola di svelamento.
-- Ritorna i conteggi/percentuali SOLO se il chiamante ha già votato,
-- oppure la votazione è 'closed', oppure il chiamante è admin.
-- Altrimenti insieme vuoto (impossibile sbirciare prima di votare).
-- ─────────────────────────────────────────────────────────────
create or replace function get_mvp_results(p_tournament_id uuid)
returns table (candidate_id uuid, name text, votes bigint, pct int)
language plpgsql
security definer
set search_path = public
as $$
declare
  can_see boolean;
  total bigint;
begin
  select
    (t.mvp_status = 'closed')
    or exists (select 1 from mvp_votes v where v.tournament_id = p_tournament_id and v.user_id = auth.uid())
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin = true)
  into can_see
  from tournaments t
  where t.id = p_tournament_id;

  if not coalesce(can_see, false) then
    return;
  end if;

  select count(*) into total from mvp_votes v where v.tournament_id = p_tournament_id;

  return query
  select
    c.id,
    c.name,
    count(v.id) as votes,
    case when total > 0 then round(100.0 * count(v.id) / total)::int else 0 end as pct
  from mvp_candidates c
  left join mvp_votes v on v.candidate_id = c.id
  where c.tournament_id = p_tournament_id
  group by c.id, c.name
  order by count(v.id) desc, c.created_at asc;
end;
$$;
