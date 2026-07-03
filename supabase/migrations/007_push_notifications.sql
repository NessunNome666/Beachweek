-- Migration 007: notifiche push (Web Push / PWA)
-- Eseguire manualmente su Supabase SQL Editor.
--
-- Due notifiche previste:
--   1) promemoria giornaliero "metti i pronostici" (cron Vercel, orario fisso)
--   2) "è aperta la votazione MVP" (inviata quando l'admin apre la votazione)
--
-- Qui vivono solo le SUBSCRIPTION dei dispositivi. L'invio avviene lato server
-- (route API con service_role, che bypassa la RLS per leggere tutte le sub).

-- ─────────────────────────────────────────────────────────────
-- SUBSCRIPTION PUSH: un dispositivo/browser per riga.
--   endpoint = URL univoco del push service del browser (chiave di dedup)
--   p256dh/auth = chiavi di cifratura del payload fornite dal browser
-- ─────────────────────────────────────────────────────────────
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

-- L'utente gestisce solo le proprie subscription. Le scritture reali passano
-- comunque dalle route API (service_role), ma teniamo la RLS per sicurezza.
create policy "users read own push subs" on push_subscriptions
  for select using (auth.uid() = user_id);

create policy "users insert own push subs" on push_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "users update own push subs" on push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users delete own push subs" on push_subscriptions
  for delete using (auth.uid() = user_id);

create index if not exists push_subscriptions_user_id_idx on push_subscriptions(user_id);

-- ─────────────────────────────────────────────────────────────
-- Anti-doppio-invio per la notifica "votazione MVP aperta".
-- Valorizzata a now() quando la push viene spedita; azzerata dal trigger qui
-- sotto ogni volta che lo stato torna diverso da 'open', così una successiva
-- riapertura può notificare di nuovo.
-- ─────────────────────────────────────────────────────────────
alter table tournaments
  add column if not exists mvp_notified_at timestamptz;

create or replace function reset_mvp_notified()
returns trigger
language plpgsql
as $$
begin
  if new.mvp_status is distinct from 'open' then
    new.mvp_notified_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists on_mvp_status_change on tournaments;
create trigger on_mvp_status_change
  before update of mvp_status on tournaments
  for each row execute function reset_mvp_notified();
