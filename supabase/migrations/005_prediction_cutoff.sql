-- Migration 005: enforcement server-side del cutoff dei pronostici
-- Eseguire manualmente su Supabase SQL Editor.
--
-- Problema risolto: il blocco dei pronostici era solo lato UI. Un utente con la
-- pagina aperta poteva salvare/modificare pronostici DOPO l'inizio della partita
-- (o dopo la fine dei gironi per il podio), falsando la competizione.
--
-- Soluzione: le RLS policy controllano lo stato del DB al momento della scrittura.
-- I trigger di scoring sono SECURITY DEFINER → girano come owner e BYPASSANO le RLS,
-- quindi l'aggiornamento di points_awarded continua a funzionare.

-- ─────────────────────────────────────────────────────────────
-- PRONOSTICI PARTITA: scrivibili solo se la partita NON è ancora iniziata
-- (cutoff = scheduled_at). Vale sia per il primo inserimento che per le modifiche.
-- ─────────────────────────────────────────────────────────────
drop policy if exists "users insert own predictions" on predictions_match;
create policy "users insert own predictions" on predictions_match
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from matches m
      where m.id = match_id and m.scheduled_at > now()
    )
  );

drop policy if exists "users update own predictions" on predictions_match;
create policy "users update own predictions" on predictions_match
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from matches m
      where m.id = match_id and m.scheduled_at > now()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- PRONOSTICI PODIO: scrivibili solo finché i gironi del torneo NON sono conclusi
-- (esiste almeno una partita di girone non ancora completata) e il torneo non è
-- bloccato manualmente. Rispecchia il lock automatico della UI.
-- ─────────────────────────────────────────────────────────────
drop policy if exists "users insert own winner predictions" on predictions_winner;
create policy "users insert own winner predictions" on predictions_winner
  for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from tournaments t
      where t.id = tournament_id and t.predictions_locked = true
    )
    and exists (
      select 1 from matches m
      where m.tournament_id = tournament_id
        and m.phase = 'girone'
        and m.status <> 'completed'
    )
  );

drop policy if exists "users update own winner predictions" on predictions_winner;
create policy "users update own winner predictions" on predictions_winner
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from tournaments t
      where t.id = tournament_id and t.predictions_locked = true
    )
    and exists (
      select 1 from matches m
      where m.tournament_id = tournament_id
        and m.phase = 'girone'
        and m.status <> 'completed'
    )
  );
