export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type NotificationType = "new_user" | "milestone_reached";

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Enums: {
      notification_type: NotificationType;
    };
    Tables: {
      profiles: Table<
        {
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
          updated_at: string;
        },
        {
          display_name?: string | null;
          email?: string | null;
          id: string;
        }
      >;
      apps: Table<
        {
          id: string;
          owner_id: string;
          name: string;
          track_token: string;
          logo_url: string | null;
          bio: string | null;
          instagram: string | null;
          tiktok: string | null;
          x_handle: string | null;
          starting_users: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          owner_id: string;
          name: string;
          track_token?: string;
          logo_url?: string | null;
          bio?: string | null;
          instagram?: string | null;
          tiktok?: string | null;
          x_handle?: string | null;
          starting_users?: number;
        }
      >;
      user_events: Table<
        {
          id: string;
          app_id: string;
          total_users: number;
          new_users: number;
          is_test: boolean;
          captured_at: string;
          created_at: string;
        },
        {
          id?: string;
          app_id: string;
          total_users: number;
          new_users: number;
          is_test?: boolean;
          captured_at?: string;
        }
      >;
      notifications: Table<
        {
          id: string;
          app_id: string;
          owner_id: string;
          type: NotificationType;
          title: string;
          body: string;
          is_read: boolean;
          created_at: string;
        },
        {
          id?: string;
          app_id: string;
          owner_id: string;
          type: NotificationType;
          title: string;
          body: string;
          is_read?: boolean;
        }
      >;
      push_subscriptions: Table<
        {
          id: string;
          owner_id: string;
          endpoint: string;
          subscription: Json;
          created_at: string;
        },
        {
          id?: string;
          owner_id: string;
          endpoint: string;
          subscription: Json;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type App = Database["public"]["Tables"]["apps"]["Row"];
export type UserEvent = Database["public"]["Tables"]["user_events"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
