import type { TournamentFormat, TournamentStatus, MatchStatus } from './supabase/types'

export const TOURNAMENTS = [
  {
    id: '1',
    slug: 'torneo-open',
    name: 'Torneo Open',
    format: 'mixed' as TournamentFormat,
    status: 'in_progress' as TournamentStatus,
    description: 'Torneo maschile/misto con fase a gironi e tabellone finale',
    predictions_locked: false,
    created_at: '2026-01-01',
  },
  {
    id: '2',
    slug: 'torneo-under',
    name: 'Torneo Under',
    format: 'round_robin' as TournamentFormat,
    status: 'upcoming' as TournamentStatus,
    description: 'Torneo per le categorie giovanili, formato girone unico',
    predictions_locked: false,
    created_at: '2026-01-01',
  },
  {
    id: '3',
    slug: 'torneo-amatori',
    name: 'Torneo Amatori',
    format: 'single_elim' as TournamentFormat,
    status: 'upcoming' as TournamentStatus,
    description: 'Torneo amatoriale a eliminazione diretta',
    predictions_locked: false,
    created_at: '2026-01-01',
  },
]

export const TEAMS = [
  // Torneo Open — Girone A
  { id: 't1', name: 'Squadra Alfa', tournament_id: '1', group_name: 'Girone A', created_at: '' },
  { id: 't2', name: 'Squadra Beta', tournament_id: '1', group_name: 'Girone A', created_at: '' },
  { id: 't3', name: 'Squadra Gamma', tournament_id: '1', group_name: 'Girone A', created_at: '' },
  { id: 't4', name: 'Squadra Delta', tournament_id: '1', group_name: 'Girone A', created_at: '' },
  // Torneo Open — Girone B
  { id: 't5', name: 'Squadra Epsilon', tournament_id: '1', group_name: 'Girone B', created_at: '' },
  { id: 't6', name: 'Squadra Zeta', tournament_id: '1', group_name: 'Girone B', created_at: '' },
  { id: 't7', name: 'Squadra Eta', tournament_id: '1', group_name: 'Girone B', created_at: '' },
  { id: 't8', name: 'Squadra Theta', tournament_id: '1', group_name: 'Girone B', created_at: '' },
  // Torneo Under — Girone unico
  { id: 't9', name: 'Under Rosso', tournament_id: '2', group_name: 'Girone Unico', created_at: '' },
  { id: 't10', name: 'Under Blu', tournament_id: '2', group_name: 'Girone Unico', created_at: '' },
  { id: 't11', name: 'Under Verde', tournament_id: '2', group_name: 'Girone Unico', created_at: '' },
  { id: 't12', name: 'Under Giallo', tournament_id: '2', group_name: 'Girone Unico', created_at: '' },
  // Torneo Amatori — eliminazione
  { id: 't13', name: 'Amatori 1', tournament_id: '3', group_name: null, created_at: '' },
  { id: 't14', name: 'Amatori 2', tournament_id: '3', group_name: null, created_at: '' },
  { id: 't15', name: 'Amatori 3', tournament_id: '3', group_name: null, created_at: '' },
  { id: 't16', name: 'Amatori 4', tournament_id: '3', group_name: null, created_at: '' },
]

const today = '2026-06-12T10:00:00Z'

export const MATCHES = [
  // Torneo Open — Girone A
  { id: 'm1', tournament_id: '1', phase: 'girone' as const, round: 1, team_home_id: 't1', team_away_id: 't2', score_home: 2, score_away: 0, scheduled_at: today, status: 'completed' as MatchStatus, court: 'Campo 1' },
  { id: 'm2', tournament_id: '1', phase: 'girone' as const, round: 1, team_home_id: 't3', team_away_id: 't4', score_home: 2, score_away: 1, scheduled_at: today, status: 'completed' as MatchStatus, court: 'Campo 2' },
  { id: 'm3', tournament_id: '1', phase: 'girone' as const, round: 2, team_home_id: 't1', team_away_id: 't3', score_home: null, score_away: null, scheduled_at: today, status: 'scheduled' as MatchStatus, court: 'Campo 1' },
  { id: 'm4', tournament_id: '1', phase: 'girone' as const, round: 2, team_home_id: 't2', team_away_id: 't4', score_home: null, score_away: null, scheduled_at: today, status: 'scheduled' as MatchStatus, court: 'Campo 2' },
  // Torneo Open — Girone B
  { id: 'm5', tournament_id: '1', phase: 'girone' as const, round: 1, team_home_id: 't5', team_away_id: 't6', score_home: 1, score_away: 2, scheduled_at: today, status: 'completed' as MatchStatus, court: 'Campo 3' },
  { id: 'm6', tournament_id: '1', phase: 'girone' as const, round: 1, team_home_id: 't7', team_away_id: 't8', score_home: 2, score_away: 0, scheduled_at: today, status: 'completed' as MatchStatus, court: 'Campo 4' },
  { id: 'm7', tournament_id: '1', phase: 'girone' as const, round: 2, team_home_id: 't5', team_away_id: 't7', score_home: null, score_away: null, scheduled_at: today, status: 'scheduled' as MatchStatus, court: 'Campo 3' },
  { id: 'm8', tournament_id: '1', phase: 'girone' as const, round: 2, team_home_id: 't6', team_away_id: 't8', score_home: null, score_away: null, scheduled_at: today, status: 'scheduled' as MatchStatus, court: 'Campo 4' },
]

export const STANDINGS = [
  // Girone A
  { tournament_id: '1', team_id: 't1', team_name: 'Squadra Alfa', group_name: 'Girone A', matches_played: 1, wins: 1, losses: 0, sets_won: 2, sets_lost: 0, points: 3 },
  { tournament_id: '1', team_id: 't3', team_name: 'Squadra Gamma', group_name: 'Girone A', matches_played: 1, wins: 1, losses: 0, sets_won: 2, sets_lost: 1, points: 3 },
  { tournament_id: '1', team_id: 't4', team_name: 'Squadra Delta', group_name: 'Girone A', matches_played: 1, wins: 0, losses: 1, sets_won: 1, sets_lost: 2, points: 1 },
  { tournament_id: '1', team_id: 't2', team_name: 'Squadra Beta', group_name: 'Girone A', matches_played: 1, wins: 0, losses: 1, sets_won: 0, sets_lost: 2, points: 0 },
  // Girone B
  { tournament_id: '1', team_id: 't6', team_name: 'Squadra Zeta', group_name: 'Girone B', matches_played: 1, wins: 1, losses: 0, sets_won: 2, sets_lost: 1, points: 3 },
  { tournament_id: '1', team_id: 't7', team_name: 'Squadra Eta', group_name: 'Girone B', matches_played: 1, wins: 1, losses: 0, sets_won: 2, sets_lost: 0, points: 3 },
  { tournament_id: '1', team_id: 't5', team_name: 'Squadra Epsilon', group_name: 'Girone B', matches_played: 1, wins: 0, losses: 1, sets_won: 1, sets_lost: 2, points: 1 },
  { tournament_id: '1', team_id: 't8', team_name: 'Squadra Theta', group_name: 'Girone B', matches_played: 1, wins: 0, losses: 1, sets_won: 0, sets_lost: 2, points: 0 },
]

export const FANTA_LEADERBOARD = [
  { user_id: 'u1', display_name: 'Marco R.', match_points: 9, winner_points: 0, total_points: 9, correct_exact: 2, correct_winner: 3 },
  { user_id: 'u2', display_name: 'Sara L.', match_points: 7, winner_points: 5, total_points: 12, correct_exact: 1, correct_winner: 4 },
  { user_id: 'u3', display_name: 'Luca M.', match_points: 6, winner_points: 5, total_points: 11, correct_exact: 2, correct_winner: 2 },
  { user_id: 'u4', display_name: 'Giulia T.', match_points: 4, winner_points: 0, total_points: 4, correct_exact: 0, correct_winner: 4 },
  { user_id: 'u5', display_name: 'Paolo V.', match_points: 3, winner_points: 0, total_points: 3, correct_exact: 1, correct_winner: 1 },
]
