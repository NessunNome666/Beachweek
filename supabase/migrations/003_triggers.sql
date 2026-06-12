-- Trigger: calcola punti fanta quando una partita viene completata
create or replace function calculate_match_prediction_points()
returns trigger as $$
begin
  -- Aggiorna punti per tutti i pronostici di questa partita
  if new.status = 'completed' and new.score_home is not null and new.score_away is not null then
    update predictions_match
    set points_awarded = case
      -- Risultato esatto
      when predicted_home = new.score_home and predicted_away = new.score_away then 3
      -- Vincitore corretto (chi ha più set vince)
      when (predicted_home > predicted_away) = (new.score_home > new.score_away) then 1
      -- Sbagliato
      else 0
    end
    where match_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_match_completed
  after update of status on matches
  for each row
  when (new.status = 'completed' and old.status != 'completed')
  execute function calculate_match_prediction_points();

-- Trigger: calcola punti per pronostici vincitore torneo
create or replace function calculate_winner_prediction_points()
returns trigger as $$
declare
  actual_winner_id uuid;
begin
  if new.status = 'completed' then
    -- Trova il vincitore della finale
    select
      case when m.score_home > m.score_away then m.team_home_id else m.team_away_id end
    into actual_winner_id
    from matches m
    where m.tournament_id = new.id and m.phase = 'finale' and m.status = 'completed'
    limit 1;

    if actual_winner_id is not null then
      update predictions_winner
      set points_awarded = case
        when predicted_team_id = actual_winner_id then 5
        else 0
      end
      where tournament_id = new.id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_tournament_completed
  after update of status on tournaments
  for each row
  when (new.status = 'completed' and old.status != 'completed')
  execute function calculate_winner_prediction_points();
