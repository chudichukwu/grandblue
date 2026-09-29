// Generated-shape database contract synchronized with migrations through 20260929100000.
// Regenerate from a linked project with: npm run types:db
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };
type Owned = { id: string; user_id: string; created_at: string; updated_at: string };

export type Database = { public: { Tables: {
  profiles: Table<{ user_id:string; display_name:string|null; timezone:string; local_data_imported_at:string|null; created_at:string; updated_at:string }>;
  daily_entries: Table<Owned & { entry_date:string; coursera_minutes:number; practice_minutes:number; project_minutes:number; review_minutes:number; modules_completed:number; energy_score:number; focus_score:number; completed_tasks:string; blockers:string; reflection:string; import_source:string|null; imported_source_id:string|null }>;
  learning_plans: Table<Owned & { title:string; description:string; starts_on:string; ends_on:string; weekly_target_minutes:number; status:"draft"|"active"|"completed"|"archived"; is_default:boolean; notes:string }>;
  plan_weeks: Table<Owned & { learning_plan_id:string; week_number:number; title:string; description:string; outcome:string; starts_on:string|null; ends_on:string|null; target_minutes:number; notes:string }>;
  tasks: Table<Owned & { plan_week_id:string; title:string; detail:string; position:number; completed_at:string|null; scheduled_date:string|null; estimated_minutes:number; actual_minutes:number; priority:"low"|"medium"|"high"; category:"course"|"practice"|"project"|"review"; deadline:string|null; notes:string; client_request_id:string }>;
  focus_sessions: Table<Owned & { session_type:string; status:Database["public"]["Enums"]["focus_session_status"]; planned_duration_seconds:number; started_at:string; ends_at:string; paused_at:string|null; completed_at:string|null; cancelled_at:string|null }>;
  notification_preferences: Table<{ user_id:string; sound_enabled:boolean; browser_push_enabled:boolean; telegram_enabled:boolean; break_alerts_enabled:boolean; focus_minutes:number; short_break_minutes:number; long_break_minutes:number; created_at:string; updated_at:string }>;
  push_subscriptions: Table<Owned & { endpoint:string; p256dh:string; auth_secret:string; user_agent:string|null; expires_at:string|null; revoked_at:string|null }>;
  telegram_connections: Table<Owned & { telegram_chat_id:string; telegram_username:string|null; verified_at:string|null; revoked_at:string|null }>;
  scheduled_notifications: Table<Owned & { focus_session_id:string|null; channel:Database["public"]["Enums"]["notification_channel"]; status:Database["public"]["Enums"]["notification_status"]; scheduled_for:string; claimed_at:string|null; delivered_at:string|null; attempt_count:number; last_error:string|null; idempotency_key:string; payload:Json }>;
  notification_deliveries: Table<{ id:string; user_id:string; scheduled_notification_id:string; channel:Database["public"]["Enums"]["notification_channel"]; attempt_number:number; status:Database["public"]["Enums"]["notification_status"]; provider_message_id:string|null; provider_result:Json; error_message:string|null; attempted_at:string; created_at:string }>;
}; Views: Record<string, never>; Functions: { ensure_default_learning_plan: { Args: Record<PropertyKey, never>; Returns: string } }; Enums: { focus_session_status:"active"|"paused"|"completed"|"cancelled"; notification_status:"pending"|"processing"|"delivered"|"failed"|"cancelled"; notification_channel:"browser_push"|"telegram"|"email"|"in_app" }; CompositeTypes: Record<string, never> } };
