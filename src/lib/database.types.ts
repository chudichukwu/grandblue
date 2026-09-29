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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      daily_entries: {
        Row: {
          blockers: string
          completed_tasks: string
          coursera_minutes: number
          created_at: string
          energy_score: number
          entry_date: string
          focus_score: number
          id: string
          import_source: string | null
          imported_source_id: string | null
          modules_completed: number
          practice_minutes: number
          project_minutes: number
          reflection: string
          review_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          blockers?: string
          completed_tasks?: string
          coursera_minutes?: number
          created_at?: string
          energy_score: number
          entry_date: string
          focus_score: number
          id?: string
          import_source?: string | null
          imported_source_id?: string | null
          modules_completed?: number
          practice_minutes?: number
          project_minutes?: number
          reflection?: string
          review_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          blockers?: string
          completed_tasks?: string
          coursera_minutes?: number
          created_at?: string
          energy_score?: number
          entry_date?: string
          focus_score?: number
          id?: string
          import_source?: string | null
          imported_source_id?: string | null
          modules_completed?: number
          practice_minutes?: number
          project_minutes?: number
          reflection?: string
          review_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          accumulated_pause_seconds: number
          actual_focus_seconds: number
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          duration_seconds: number
          ends_at: string
          id: string
          paused_at: string | null
          remaining_seconds_when_paused: number | null
          session_type: string
          skipped_at: string | null
          start_request_id: string
          started_at: string
          status: Database["public"]["Enums"]["focus_session_status"]
          task_id: string | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          accumulated_pause_seconds?: number
          actual_focus_seconds?: number
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          duration_seconds: number
          ends_at: string
          id?: string
          paused_at?: string | null
          remaining_seconds_when_paused?: number | null
          session_type: string
          skipped_at?: string | null
          start_request_id?: string
          started_at: string
          status?: Database["public"]["Enums"]["focus_session_status"]
          task_id?: string | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          accumulated_pause_seconds?: number
          actual_focus_seconds?: number
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number
          ends_at?: string
          id?: string
          paused_at?: string | null
          remaining_seconds_when_paused?: number | null
          session_type?: string
          skipped_at?: string | null
          start_request_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["focus_session_status"]
          task_id?: string | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_task_owner_fk"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      in_app_notifications: {
        Row: {
          body: string
          created_at: string
          focus_session_id: string | null
          href: string | null
          id: string
          kind: string
          read_at: string | null
          task_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          focus_session_id?: string | null
          href?: string | null
          id?: string
          kind: string
          read_at?: string | null
          task_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          focus_session_id?: string | null
          href?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          task_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "in_app_notifications_focus_session_id_user_id_fkey"
            columns: ["focus_session_id", "user_id"]
            isOneToOne: false
            referencedRelation: "focus_sessions"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "in_app_notifications_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      learning_plans: {
        Row: {
          created_at: string
          description: string
          ends_on: string
          id: string
          is_default: boolean
          notes: string
          starts_on: string
          status: string
          title: string
          updated_at: string
          user_id: string
          weekly_target_minutes: number
        }
        Insert: {
          created_at?: string
          description?: string
          ends_on: string
          id?: string
          is_default?: boolean
          notes?: string
          starts_on: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          weekly_target_minutes?: number
        }
        Update: {
          created_at?: string
          description?: string
          ends_on?: string
          id?: string
          is_default?: boolean
          notes?: string
          starts_on?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          weekly_target_minutes?: number
        }
        Relationships: []
      }
      notification_deliveries: {
        Row: {
          attempt_number: number
          attempted_at: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          error_message: string | null
          id: string
          provider_message_id: string | null
          provider_result: Json
          scheduled_notification_id: string
          status: Database["public"]["Enums"]["notification_status"]
          user_id: string
        }
        Insert: {
          attempt_number: number
          attempted_at?: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error_message?: string | null
          id?: string
          provider_message_id?: string | null
          provider_result?: Json
          scheduled_notification_id: string
          status: Database["public"]["Enums"]["notification_status"]
          user_id: string
        }
        Update: {
          attempt_number?: number
          attempted_at?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error_message?: string | null
          id?: string
          provider_message_id?: string | null
          provider_result?: Json
          scheduled_notification_id?: string
          status?: Database["public"]["Enums"]["notification_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_scheduled_notification_id_user_id_fkey"
            columns: ["scheduled_notification_id", "user_id"]
            isOneToOne: false
            referencedRelation: "scheduled_notifications"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          auto_start_break: boolean
          auto_start_focus: boolean
          break_alerts_enabled: boolean
          browser_push_enabled: boolean
          created_at: string
          focus_minutes: number
          in_app_alerts_enabled: boolean
          long_break_after_sessions: number
          long_break_minutes: number
          short_break_minutes: number
          sound_enabled: boolean
          telegram_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_start_break?: boolean
          auto_start_focus?: boolean
          break_alerts_enabled?: boolean
          browser_push_enabled?: boolean
          created_at?: string
          focus_minutes?: number
          in_app_alerts_enabled?: boolean
          long_break_after_sessions?: number
          long_break_minutes?: number
          short_break_minutes?: number
          sound_enabled?: boolean
          telegram_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_start_break?: boolean
          auto_start_focus?: boolean
          break_alerts_enabled?: boolean
          browser_push_enabled?: boolean
          created_at?: string
          focus_minutes?: number
          in_app_alerts_enabled?: boolean
          long_break_after_sessions?: number
          long_break_minutes?: number
          short_break_minutes?: number
          sound_enabled?: boolean
          telegram_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_weeks: {
        Row: {
          created_at: string
          description: string
          ends_on: string | null
          id: string
          learning_plan_id: string
          notes: string
          outcome: string
          starts_on: string | null
          target_minutes: number
          title: string
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          description?: string
          ends_on?: string | null
          id?: string
          learning_plan_id: string
          notes?: string
          outcome?: string
          starts_on?: string | null
          target_minutes?: number
          title: string
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          description?: string
          ends_on?: string | null
          id?: string
          learning_plan_id?: string
          notes?: string
          outcome?: string
          starts_on?: string | null
          target_minutes?: number
          title?: string
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_weeks_learning_plan_id_user_id_fkey"
            columns: ["learning_plan_id", "user_id"]
            isOneToOne: false
            referencedRelation: "learning_plans"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          local_data_imported_at: string | null
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          local_data_imported_at?: string | null
          timezone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          local_data_imported_at?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_secret: string
          created_at: string
          endpoint: string
          expires_at: string | null
          id: string
          p256dh: string
          revoked_at: string | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_secret: string
          created_at?: string
          endpoint: string
          expires_at?: string | null
          id?: string
          p256dh: string
          revoked_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_secret?: string
          created_at?: string
          endpoint?: string
          expires_at?: string | null
          id?: string
          p256dh?: string
          revoked_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_notifications: {
        Row: {
          attempt_count: number
          channel: Database["public"]["Enums"]["notification_channel"]
          claimed_at: string | null
          created_at: string
          delivered_at: string | null
          focus_session_id: string | null
          id: string
          idempotency_key: string
          last_error: string | null
          payload: Json
          scheduled_for: string
          status: Database["public"]["Enums"]["notification_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_count?: number
          channel: Database["public"]["Enums"]["notification_channel"]
          claimed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          focus_session_id?: string | null
          id?: string
          idempotency_key: string
          last_error?: string | null
          payload?: Json
          scheduled_for: string
          status?: Database["public"]["Enums"]["notification_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_count?: number
          channel?: Database["public"]["Enums"]["notification_channel"]
          claimed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          focus_session_id?: string | null
          id?: string
          idempotency_key?: string
          last_error?: string | null
          payload?: Json
          scheduled_for?: string
          status?: Database["public"]["Enums"]["notification_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_notifications_focus_session_id_user_id_fkey"
            columns: ["focus_session_id", "user_id"]
            isOneToOne: false
            referencedRelation: "focus_sessions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_minutes: number
          category: string
          client_request_id: string
          completed_at: string | null
          created_at: string
          deadline: string | null
          detail: string
          estimated_minutes: number
          id: string
          notes: string
          plan_week_id: string
          position: number
          priority: string
          scheduled_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_minutes?: number
          category?: string
          client_request_id?: string
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          detail?: string
          estimated_minutes?: number
          id?: string
          notes?: string
          plan_week_id: string
          position?: number
          priority?: string
          scheduled_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_minutes?: number
          category?: string
          client_request_id?: string
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          detail?: string
          estimated_minutes?: number
          id?: string
          notes?: string
          plan_week_id?: string
          position?: number
          priority?: string
          scheduled_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_plan_week_id_user_id_fkey"
            columns: ["plan_week_id", "user_id"]
            isOneToOne: false
            referencedRelation: "plan_weeks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      telegram_connections: {
        Row: {
          created_at: string
          id: string
          revoked_at: string | null
          telegram_chat_id: string
          telegram_username: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          revoked_at?: string | null
          telegram_chat_id: string
          telegram_username?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          revoked_at?: string | null
          telegram_chat_id?: string
          telegram_username?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_due_notifications: {
        Args: { p_limit?: number }
        Returns: {
          attempt_count: number
          channel: Database["public"]["Enums"]["notification_channel"]
          claimed_at: string | null
          created_at: string
          delivered_at: string | null
          focus_session_id: string | null
          id: string
          idempotency_key: string
          last_error: string | null
          payload: Json
          scheduled_for: string
          status: Database["public"]["Enums"]["notification_status"]
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "scheduled_notifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      ensure_default_learning_plan: { Args: never; Returns: string }
      fail_notification: {
        Args: {
          p_error: string
          p_max_attempts?: number
          p_notification_id: string
        }
        Returns: undefined
      }
      process_timer_notification: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      timer_finish: {
        Args: {
          p_action: string
          p_expected_version: number
          p_session_id: string
        }
        Returns: {
          accumulated_pause_seconds: number
          actual_focus_seconds: number
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          duration_seconds: number
          ends_at: string
          id: string
          paused_at: string | null
          remaining_seconds_when_paused: number | null
          session_type: string
          skipped_at: string | null
          start_request_id: string
          started_at: string
          status: Database["public"]["Enums"]["focus_session_status"]
          task_id: string | null
          updated_at: string
          user_id: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "focus_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      timer_pause: {
        Args: { p_expected_version: number; p_session_id: string }
        Returns: {
          accumulated_pause_seconds: number
          actual_focus_seconds: number
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          duration_seconds: number
          ends_at: string
          id: string
          paused_at: string | null
          remaining_seconds_when_paused: number | null
          session_type: string
          skipped_at: string | null
          start_request_id: string
          started_at: string
          status: Database["public"]["Enums"]["focus_session_status"]
          task_id: string | null
          updated_at: string
          user_id: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "focus_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      timer_resume: {
        Args: { p_expected_version: number; p_session_id: string }
        Returns: {
          accumulated_pause_seconds: number
          actual_focus_seconds: number
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          duration_seconds: number
          ends_at: string
          id: string
          paused_at: string | null
          remaining_seconds_when_paused: number | null
          session_type: string
          skipped_at: string | null
          start_request_id: string
          started_at: string
          status: Database["public"]["Enums"]["focus_session_status"]
          task_id: string | null
          updated_at: string
          user_id: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "focus_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      timer_start: {
        Args: {
          p_duration_seconds: number
          p_request_id: string
          p_session_type: string
          p_task_id: string
        }
        Returns: {
          accumulated_pause_seconds: number
          actual_focus_seconds: number
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          duration_seconds: number
          ends_at: string
          id: string
          paused_at: string | null
          remaining_seconds_when_paused: number | null
          session_type: string
          skipped_at: string | null
          start_request_id: string
          started_at: string
          status: Database["public"]["Enums"]["focus_session_status"]
          task_id: string | null
          updated_at: string
          user_id: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "focus_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      focus_session_status:
        | "scheduled"
        | "active"
        | "paused"
        | "completed"
        | "skipped"
        | "cancelled"
      notification_channel: "browser_push" | "telegram" | "email" | "in_app"
      notification_status:
        | "pending"
        | "processing"
        | "delivered"
        | "failed"
        | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      focus_session_status: [
        "scheduled",
        "active",
        "paused",
        "completed",
        "skipped",
        "cancelled",
      ],
      notification_channel: ["browser_push", "telegram", "email", "in_app"],
      notification_status: [
        "pending",
        "processing",
        "delivered",
        "failed",
        "cancelled",
      ],
    },
  },
} as const
