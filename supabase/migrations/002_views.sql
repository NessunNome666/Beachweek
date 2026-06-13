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
-- Usa CTE per evitare prodotto cartesiano tra predictions_match e predictions_winner
create or replace view fanta_leaderboard as
with match_pts as (
  select user_id,
    sum(coalesce(points_awarded, 0)) as match_points,
    count(case when points_awarded = 3 then 1 end) as correct_exact,
    count(case when points_awarded >= 1 then 1 end) as correct_winner
  from predictions_match
  group by user_id
),
winner_pts as (
  select user_id,
    sum(coalesce(points_awarded, 0)) as winner_points
  from predictions_winner
  group by user_id
)
select
  u.id as user_id,
  u.display_name,
  coalesce(mp.match_points, 0)::int as match_points,
  coalesce(wp.winner_points, 0)::int as winner_points,
  (coalesce(mp.match_points, 0) + coalesce(wp.winner_points, 0))::int as total_points,
  coalesce(mp.correct_exact, 0)::int as correct_exact,
  coalesce(mp.correct_winner, 0)::int as correct_winner
from users u
left join match_pts mp on mp.user_id = u.id
left join winner_pts wp on wp.user_id = u.id
order by total_points desc;
