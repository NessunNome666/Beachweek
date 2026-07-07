-- 010: Rose squadre — elenco atleti per team (sola visualizzazione).
-- Lettura pubblica già coperta da "public read teams" (001_schema.sql).
-- Scritture solo da SQL Editor come postgres (bypassa RLS): nessuna nuova policy.
alter table teams add column players text[];
