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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      participants: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          ended_at: string | null
          id: string
          participant_id: string
          started_at: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          participant_id: string
          started_at?: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          participant_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      video_events: {
        Row: {
          event_time: string
          event_type: Database["public"]["Enums"]["video_event_type"]
          id: string
          metadata: Json | null
          participant_id: string
          playback_position_sec: number | null
          sequence_index: number
          session_id: string
          video_id: string | null
          watch_duration_sec: number | null
        }
        Insert: {
          event_time?: string
          event_type: Database["public"]["Enums"]["video_event_type"]
          id?: string
          metadata?: Json | null
          participant_id: string
          playback_position_sec?: number | null
          sequence_index?: number
          session_id: string
          video_id?: string | null
          watch_duration_sec?: number | null
        }
        Update: {
          event_time?: string
          event_type?: Database["public"]["Enums"]["video_event_type"]
          id?: string
          metadata?: Json | null
          participant_id?: string
          playback_position_sec?: number | null
          sequence_index?: number
          session_id?: string
          video_id?: string | null
          watch_duration_sec?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_events_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_events_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          channel_name: string
          comment_count: number
          created_at: string
          description: string | null
          duration_sec: number
          id: string
          like_count: number
          order_index: number
          profile_image: string | null
          share_count: number
          thumbnail: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          channel_name: string
          comment_count?: number
          created_at?: string
          description?: string | null
          duration_sec?: number
          id?: string
          like_count?: number
          order_index?: number
          profile_image?: string | null
          share_count?: number
          thumbnail?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          channel_name?: string
          comment_count?: number
          created_at?: string
          description?: string | null
          duration_sec?: number
          id?: string
          like_count?: number
          order_index?: number
          profile_image?: string | null
          share_count?: number
          thumbnail?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      video_event_type:
        | "session_start"
        | "video_impression"
        | "play"
        | "pause"
        | "resume"
        | "skip"
        | "complete"
        | "like"
        | "unlike"
        | "comment_open"
        | "share_click"
        | "session_end"
        | "exit"
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
      video_event_type: [
        "session_start",
        "video_impression",
        "play",
        "pause",
        "resume",
        "skip",
        "complete",
        "like",
        "unlike",
        "comment_open",
        "share_click",
        "session_end",
        "exit",
      ],
    },
  },
} as const
