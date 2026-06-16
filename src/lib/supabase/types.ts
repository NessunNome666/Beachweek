export type TournamentFormat = 'round_robin' | 'single_elim' | 'mixed'
export type TournamentStatus = 'upcoming' | 'in_progress' | 'completed'
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'postponed'
export type MatchPhase = 'girone' | 'ottavi' | 'quarti' | 'semifinale' | 'finale' | 'terzo_posto'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          is_admin: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      tournaments: {
        Row: {
          id: string
          slug: string
          name: string
          format: TournamentFormat
          status: TournamentStatus
          description: string | null
          predictions_locked: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tournaments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tournaments']['Insert']>
      }
      teams: {
        Row: {
          id: string
          name: string
          tournament_id: string
          group_name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['teams']['Insert']>
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          phase: MatchPhase
          round: number
          team_home_id: string | null
          team_away_id: string | null
          score_home: number | null
          score_away: number | null
          scheduled_at: string
          status: MatchStatus
          court: string | null
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      predictions_match: {
        Row: {
          id: string
          user_id: string
          match_id: string
          predicted_home: number
          predicted_away: number
          points_awarded: number | null
          submitted_at: string
        }
        Insert: Omit<Database['public']['Tables']['predictions_match']['Row'], 'id' | 'submitted_at'>
        Update: Partial<Database['public']['Tables']['predictions_match']['Insert']>
      }
      predictions_winner: {
        Row: {
          id: string
          user_id: string
          tournament_id: string
          predicted_team_id: string
          points_awarded: number | null
          submitted_at: string
        }
        Insert: Omit<Database['public']['Tables']['predictions_winner']['Row'], 'id' | 'submitted_at'>
        Update: Partial<Database['public']['Tables']['predictions_winner']['Insert']>
      }
    }
    Views: {
      standings_view: {
        Row: {
          tournament_id: string
          team_id: string
          team_name: string
          group_name: string
          matches_played: number
          wins: number
          losses: number
          sets_won: number
          sets_lost: number
          points: number
        }
      }
      fanta_leaderboard: {
        Row: {
          user_id: string
          display_name: string
          match_points: number
          winner_points: number
          total_points: number
          correct_exact: number
          correct_winner: number
        }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
