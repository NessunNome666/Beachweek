-- Fix standings_view: usa t.tournament_id invece di m.tournament_id
-- così le squadre senza partite appaiono comunque nella classifica con 0 ovunque.
create or replace view standings_view as
select
  t.tournament_id,
  t.id as team_id,
  t.name as team_name,
  t.group_name,
  count(case when m.status = 'completed' then 1 end)::int as matches_played,
  count(case
    when m.status = 'completed' and (
      (m.team_home_id = t.id and m.score_home > m.score_away) or
      (m.team_away_id = t.id and m.score_away > m.score_home)
    ) then 1
  end)::int as wins,
  count(case
    when m.status = 'completed' and (
      (m.team_home_id = t.id and m.score_home < m.score_away) or
      (m.team_away_id = t.id and m.score_away < m.score_home)
    ) then 1
  end)::int as losses,
  coalesce(sum(case when m.team_home_id = t.id and m.status = 'completed' then m.score_home
                    when m.team_away_id = t.id and m.status = 'completed' then m.score_away
                    else 0 end)::int, 0) as sets_won,
  coalesce(sum(case when m.team_home_id = t.id and m.status = 'completed' then m.score_away
                    when m.team_away_id = t.id and m.status = 'completed' then m.score_home
                    else 0 end)::int, 0) as sets_lost,
  (count(case
    when m.status = 'completed' and (
      (m.team_home_id = t.id and m.score_home > m.score_away) or
      (m.team_away_id = t.id and m.score_away > m.score_home)
    ) then 1
  end) * 3 +
  count(case
    when m.status = 'completed' and (
      (m.team_home_id = t.id and m.score_home < m.score_away) or
      (m.team_away_id = t.id and m.status = 'completed' and m.score_away < m.score_home)
    ) then 1
  end))::int as points
from teams t
left join matches m on (m.team_home_id = t.id or m.team_away_id = t.id)
  and m.phase = 'girone'
group by t.tournament_id, t.id, t.name, t.group_name;

alter view standings_view set (security_invoker = true);
