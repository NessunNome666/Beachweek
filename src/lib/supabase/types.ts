export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      matches: {
        Row: {
          court: string | null
          id: string
          notes: string | null
          phase: Database["public"]["Enums"]["match_phase"]
          round: number
          scheduled_at: string
          score_away: number | null
          score_detail: string | null
          score_home: number | null
          status: Database["public"]["Enums"]["match_status"]
          team_away_id: string | null
          team_home_id: string | null
          tournament_id: string
        }
        Insert: {
          court?: string | null
          id?: string
          notes?: string | null
          phase: Database["public"]["Enums"]["match_phase"]
          round?: number
          scheduled_at: string
          score_away?: number | null
          score_detail?: string | null
          score_home?: number | null
          status?: Database["public"]["Enums"]["match_status"]
          team_away_id?: string | null
          team_home_id?: string | null
          tournament_id: string
        }
        Update: {
          court?: string | null
          id?: string
          notes?: string | null
          phase?: Database["public"]["Enums"]["match_phase"]
          round?: number
          scheduled_at?: string
          score_away?: number | null
          score_detail?: string | null
          score_home?: number | null
          status?: Database["public"]["Enums"]["match_status"]
          team_away_id?: string | null
          team_home_id?: string | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_team_away_id_fkey"
            columns: ["team_away_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_team_away_id_fkey"
            columns: ["team_away_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_home_id_fkey"
            columns: ["team_home_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_team_home_id_fkey"
            columns: ["team_home_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      mvp_candidates: {
        Row: {
          created_at: string
          id: string
          name: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mvp_candidates_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      mvp_votes: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mvp_votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "mvp_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_votes_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fanta_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mvp_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions_match: {
        Row: {
          id: string
          match_id: string
          points_awarded: number | null
          predicted_away: number
          predicted_home: number
          submitted_at: string
          user_id: string
        }
        Insert: {
          id?: string
          match_id: string
          points_awarded?: number | null
          predicted_away: number
          predicted_home: number
          submitted_at?: string
          user_id: string
        }
        Update: {
          id?: string
          match_id?: string
          points_awarded?: number | null
          predicted_away?: number
          predicted_home?: number
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_match_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_match_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fanta_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "predictions_match_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions_winner: {
        Row: {
          id: string
          placement: number
          points_awarded: number | null
          predicted_team_id: string
          submitted_at: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          id?: string
          placement?: number
          points_awarded?: number | null
          predicted_team_id: string
          submitted_at?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          id?: string
          placement?: number
          points_awarded?: number | null
          predicted_team_id?: string
          submitted_at?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_winner_predicted_team_id_fkey"
            columns: ["predicted_team_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "predictions_winner_predicted_team_id_fkey"
            columns: ["predicted_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_winner_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_winner_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fanta_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "predictions_winner_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spotted_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spotted_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "spotted_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spotted_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "spotted_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spotted_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fanta_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "spotted_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spotted_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spotted_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fanta_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "spotted_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          group_name: string | null
          id: string
          name: string
          players: string[] | null
          tournament_id: string
        }
        Insert: {
          created_at?: string
          group_name?: string | null
          id?: string
          name: string
          players?: string[] | null
          tournament_id: string
        }
        Update: {
          created_at?: string
          group_name?: string | null
          id?: string
          name?: string
          players?: string[] | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          description: string | null
          format: Database["public"]["Enums"]["tournament_format"]
          id: string
          mvp_status: string
          name: string
          predictions_locked: boolean
          slug: string
          status: Database["public"]["Enums"]["tournament_status"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          format: Database["public"]["Enums"]["tournament_format"]
          id?: string
          mvp_status?: string
          name: string
          predictions_locked?: boolean
          slug: string
          status?: Database["public"]["Enums"]["tournament_status"]
        }
        Update: {
          created_at?: string
          description?: string | null
          format?: Database["public"]["Enums"]["tournament_format"]
          id?: string
          mvp_status?: string
          name?: string
          predictions_locked?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["tournament_status"]
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
          is_admin: boolean
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          id: string
          is_admin?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          is_admin?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      fanta_leaderboard: {
        Row: {
          correct_exact: number | null
          correct_winner: number | null
          display_name: string | null
          match_points: number | null
          total_points: number | null
          user_id: string | null
          winner_points: number | null
        }
        Relationships: []
      }
      fanta_leaderboard_daily: {
        Row: {
          correct_exact: number | null
          correct_winner: number | null
          day_points: number | null
          display_name: string | null
          game_date: string | null
          user_id: string | null
        }
        Relationships: []
      }
      spotted_feed: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          likes: number | null
        }
        Relationships: []
      }
      standings_view: {
        Row: {
          group_name: string | null
          losses: number | null
          matches_played: number | null
          points: number | null
          points_conceded: number | null
          points_scored: number | null
          sets_lost: number | null
          sets_won: number | null
          team_id: string | null
          team_name: string | null
          tournament_id: string | null
          wins: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_mvp_results: {
        Args: { p_tournament_id: string }
        Returns: {
          candidate_id: string
          name: string
          pct: number
          votes: number
        }[]
      }
      spotted_emergency_cleanup: {
        Args: { delete_count?: number }
        Returns: number
      }
      spotted_recent_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      match_phase:
        | "girone"
        | "quarti"
        | "semifinale"
        | "finale"
        | "terzo_posto"
        | "ottavi"
      match_status: "scheduled" | "in_progress" | "completed" | "postponed"
      tournament_format: "round_robin" | "single_elim" | "mixed"
      tournament_status: "upcoming" | "in_progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      match_phase: [
        "girone",
        "quarti",
        "semifinale",
        "finale",
        "terzo_posto",
        "ottavi",
      ],
      match_status: ["scheduled", "in_progress", "completed", "postponed"],
      tournament_format: ["round_robin", "single_elim", "mixed"],
      tournament_status: ["upcoming", "in_progress", "completed"],
    },
  },
} as const

// ─────────────────────────────────────────────────────────────
// Alias di compatibilità (retro-compat con il codice esistente)
// ─────────────────────────────────────────────────────────────
export type TournamentFormat = Database["public"]["Enums"]["tournament_format"]
export type TournamentStatus = Database["public"]["Enums"]["tournament_status"]
export type MatchStatus = Database["public"]["Enums"]["match_status"]
export type MatchPhase = Database["public"]["Enums"]["match_phase"]
