-- Vista classifica gironi
create or replace view standings_view as
select
  m.tournament_id,
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
      (m.team_away_id = t.id and m.score_away < m.score_home)
    ) then 1
  end))::int as points
from teams t
left join matches m on (m.team_home_id = t.id or m.team_away_id = t.id)
  and m.phase = 'girone'
group by m.tournament_id, t.id, t.name, t.group_name;

-- Vista classifica fantacompetizione
create or replace view fanta_leaderboard as
select
  u.id as user_id,
  u.display_name,
  coalesce(sum(pm.points_awarded), 0)::int as match_points,
  coalesce(sum(pw.points_awarded), 0)::int as winner_points,
  (coalesce(sum(pm.points_awarded), 0) + coalesce(sum(pw.points_awarded), 0))::int as total_points,
  count(case when pm.points_awarded = 3 then 1 end)::int as correct_exact,
  count(case when pm.points_awarded >= 1 then 1 end)::int as correct_winner
from users u
left join predictions_match pm on pm.user_id = u.id
left join predictions_winner pw on pw.user_id = u.id
group by u.id, u.display_name
order by total_points desc;
