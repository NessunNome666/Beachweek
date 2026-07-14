-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 014: Spotted Beach — segnalazioni anonime con pre-moderazione admin,
-- like e pulizia d'emergenza.
--
-- Anonimato = verso i lettori: user_id resta nel db (responsabilità/limite
-- giornaliero) ma NON raggiunge mai i client. La lettura pubblica passa dalla
-- view definer spotted_feed (solo id, content, created_at, likes dei post
-- approvati), stesso pattern di fanta_leaderboard (011/012/013).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Tabella post ─────────────────────────────────────────────────────────────

create table if not exists spotted_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 3 and 300),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- Serve sia al feed (approved + ordinamento) sia alla coda admin (pending)
create index if not exists spotted_posts_status_created_idx
  on spotted_posts (status, created_at desc);

-- ── Tabella like ─────────────────────────────────────────────────────────────

create table if not exists spotted_likes (
  post_id uuid not null references spotted_posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists spotted_likes_user_idx on spotted_likes (user_id);

-- ── RLS post ─────────────────────────────────────────────────────────────────

alter table spotted_posts enable row level security;

-- L'utente vede SOLO i propri post.
create policy "users read own spotted" on spotted_posts
  for select using (auth.uid() = user_id);

-- Conteggio per il limite giornaliero: DEVE essere una funzione definer —
-- una subquery su spotted_posts dentro una policy della stessa tabella causa
-- "infinite recursion detected in policy" (42P17) su ogni insert.
-- Senza parametro di proposito: conta solo il chiamante (auth.uid()), così
-- via /rest/v1/rpc nessuno può contare i post altrui.
create or replace function public.spotted_recent_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from spotted_posts
  where user_id = auth.uid()
    and created_at > now() - interval '24 hours';
$$;

revoke execute on function public.spotted_recent_count() from public, anon;
grant execute on function public.spotted_recent_count() to authenticated;

-- Inserimento: solo per sé, solo pending, max 10 nelle ultime 24 ore
-- (anti-spam; la moderazione resta il vero cancello).
create policy "users insert own spotted" on spotted_posts
  for insert
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and public.spotted_recent_count() < 10
  );

-- Nessuna policy update/delete per gli utenti: il post inviato è irrevocabile
-- (come mvp_votes). Modera solo l'admin.

create policy "admin read spotted" on spotted_posts
  for select using (exists (select 1 from users where id = auth.uid() and is_admin = true));

create policy "admin update spotted" on spotted_posts
  for update using (exists (select 1 from users where id = auth.uid() and is_admin = true));

create policy "admin delete spotted" on spotted_posts
  for delete using (exists (select 1 from users where id = auth.uid() and is_admin = true));

-- ── Feed pubblico ────────────────────────────────────────────────────────────

-- View definer: nasconde user_id e status, espone il conteggio like.
-- L'advisor la segnalerà come security_definer_view (+ auth_users assente qui):
-- voluto, stessa classe accettata di fanta_leaderboard / fanta_leaderboard_daily.
create view public.spotted_feed as
select
  p.id,
  p.content,
  p.created_at,
  count(l.user_id)::int as likes
from spotted_posts p
left join spotted_likes l on l.post_id = p.id
where p.status = 'approved'
group by p.id, p.content, p.created_at;

alter view public.spotted_feed set (security_invoker = false);
grant select on public.spotted_feed to anon, authenticated;

-- ── RLS like ─────────────────────────────────────────────────────────────────

alter table spotted_likes enable row level security;

-- Ognuno vede/gestisce solo i propri like: l'identità di chi mette like non
-- esce mai (il conteggio aggregato arriva dalla view definer).
create policy "users read own likes" on spotted_likes
  for select using (auth.uid() = user_id);

-- Like solo a post APPROVATI: il check passa da spotted_feed che, essendo
-- definer, vede tutti gli approvati (una subquery diretta su spotted_posts
-- vedrebbe solo i propri post per via dell'RLS del chiamante).
create policy "users insert own likes" on spotted_likes
  for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.spotted_feed f where f.id = post_id)
  );

-- Il like è revocabile (toggle).
create policy "users delete own likes" on spotted_likes
  for delete using (auth.uid() = user_id);

-- ── Pulizia d'emergenza ──────────────────────────────────────────────────────

-- Extrema ratio se la tabella dovesse mai pesare sul db: elimina gli N spot
-- meno rilevanti (prima chi ha meno like, a parità i più vecchi; qualunque
-- status — anche la coda pending, se l'emergenza è una spam-flood).
-- Solo admin: check interno + revoke execute (FROM PUBLIC, vedi 011).
create or replace function public.spotted_emergency_cleanup(delete_count integer default 50)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted integer;
begin
  if not exists (select 1 from users where id = auth.uid() and is_admin = true) then
    raise exception 'solo admin';
  end if;

  with da_eliminare as (
    select p.id
    from spotted_posts p
    left join spotted_likes l on l.post_id = p.id
    group by p.id
    order by count(l.user_id) asc, p.created_at asc
    limit greatest(coalesce(delete_count, 0), 0)
  )
  delete from spotted_posts where id in (select id from da_eliminare);

  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

revoke execute on function public.spotted_emergency_cleanup(integer) from public, anon;
grant execute on function public.spotted_emergency_cleanup(integer) to authenticated;
