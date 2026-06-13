-- Aggiunge lo stato "postponed" all'enum match_status
ALTER TYPE match_status ADD VALUE IF NOT EXISTS 'postponed';

-- Aggiunge colonna notes alle partite (per note admin tipo "Rinviata per pioggia")
ALTER TABLE matches ADD COLUMN IF NOT EXISTS notes text;
