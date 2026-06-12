-- Seed: dati placeholder. Sostituire con i dati reali prima dell'evento.

insert into tournaments (slug, name, format, status, description) values
  ('torneo-open', 'Torneo Open', 'mixed', 'in_progress', 'Torneo maschile/misto con fase a gironi e tabellone finale'),
  ('torneo-under', 'Torneo Under', 'round_robin', 'upcoming', 'Torneo per le categorie giovanili, formato girone unico'),
  ('torneo-amatori', 'Torneo Amatori', 'single_elim', 'upcoming', 'Torneo amatoriale a eliminazione diretta');

-- Torneo Open — squadre (sostituire i nomi con quelli reali)
with t as (select id from tournaments where slug = 'torneo-open')
insert into teams (name, tournament_id, group_name) values
  ('Squadra Alfa', (select id from t), 'Girone A'),
  ('Squadra Beta', (select id from t), 'Girone A'),
  ('Squadra Gamma', (select id from t), 'Girone A'),
  ('Squadra Delta', (select id from t), 'Girone A'),
  ('Squadra Epsilon', (select id from t), 'Girone B'),
  ('Squadra Zeta', (select id from t), 'Girone B'),
  ('Squadra Eta', (select id from t), 'Girone B'),
  ('Squadra Theta', (select id from t), 'Girone B');
