export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      driver: {
        Row: {
          color: string | null;
          id: string;
          plate: string | null;
          price: number;
          qr_url: string | null;
          rating: number | null;
          rides: number;
          seats: number | null;
          votes: number;
          wallet_address: string | null;
        };
        Insert: {
          color?: string | null;
          id: string;
          plate?: string | null;
          price?: number;
          qr_url?: string | null;
          rating?: number | null;
          rides?: number;
          seats?: number | null;
          votes?: number;
          wallet_address?: string | null;
        };
        Update: {
          color?: string | null;
          id?: string;
          plate?: string | null;
          price?: number;
          qr_url?: string | null;
          rating?: number | null;
          rides?: number;
          seats?: number | null;
          votes?: number;
          wallet_address?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'driver_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'profile';
            referencedColumns: ['id'];
          },
        ];
      };
      location: {
        Row: {
          coords: unknown;
          created_at: string;
          id: string;
          name: string;
          type: Database['public']['Enums']['location_type'];
          user_id: string | null;
        };
        Insert: {
          coords: unknown;
          created_at?: string;
          id?: string;
          name?: string;
          type?: Database['public']['Enums']['location_type'];
          user_id?: string | null;
        };
        Update: {
          coords?: unknown;
          created_at?: string;
          id?: string;
          name?: string;
          type?: Database['public']['Enums']['location_type'];
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'location_user_id_fkey1';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profile';
            referencedColumns: ['id'];
          },
        ];
      };
      profile: {
        Row: {
          avatar: string | null;
          contribution: number;
          id: string;
          is_driver: boolean;
          last_travel: string | null;
          location_id: string | null;
          rating: number | null;
          rides: number;
          tag: string;
          votes: number;
        };
        Insert: {
          avatar?: string | null;
          contribution?: number;
          id: string;
          is_driver?: boolean;
          last_travel?: string | null;
          location_id?: string | null;
          rating?: number | null;
          rides?: number;
          tag: string;
          votes?: number;
        };
        Update: {
          avatar?: string | null;
          contribution?: number;
          id?: string;
          is_driver?: boolean;
          last_travel?: string | null;
          location_id?: string | null;
          rating?: number | null;
          rides?: number;
          tag?: string;
          votes?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'profile_location_id_fkey';
            columns: ['location_id'];
            isOneToOne: false;
            referencedRelation: 'location';
            referencedColumns: ['id'];
          },
        ];
      };
      travel_room: {
        Row: {
          active: boolean;
          allow: boolean;
          created_at: string;
          current_stop: number;
          datetime: string;
          direction: Database['public']['Enums']['travel_direction'];
          id: string;
          owner_id: string;
          recurrence_rule: string | null;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          allow?: boolean;
          created_at?: string;
          current_stop?: number;
          datetime: string;
          direction: Database['public']['Enums']['travel_direction'];
          id?: string;
          owner_id: string;
          recurrence_rule?: string | null;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          allow?: boolean;
          created_at?: string;
          current_stop?: number;
          datetime?: string;
          direction?: Database['public']['Enums']['travel_direction'];
          id?: string;
          owner_id?: string;
          recurrence_rule?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'travel_room_owner_id_fkey1';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profile';
            referencedColumns: ['id'];
          },
        ];
      };
      travel_room_message: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          room_id: string;
          type: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          room_id: string;
          type?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          room_id?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'travel_room_message_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'travel_room';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'travel_room_message_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profile';
            referencedColumns: ['id'];
          },
        ];
      };
      travel_room_stop: {
        Row: {
          confirmed: boolean;
          created_at: string;
          price: number;
          room_id: string;
          seats: number;
          stop_coords: unknown;
          user_id: string;
          user_role: Database['public']['Enums']['user_role'];
        };
        Insert: {
          confirmed?: boolean;
          created_at?: string;
          price?: number;
          room_id: string;
          seats?: number;
          stop_coords: unknown;
          user_id: string;
          user_role: Database['public']['Enums']['user_role'];
        };
        Update: {
          confirmed?: boolean;
          created_at?: string;
          price?: number;
          room_id?: string;
          seats?: number;
          stop_coords?: unknown;
          user_id?: string;
          user_role?: Database['public']['Enums']['user_role'];
        };
        Relationships: [
          {
            foreignKeyName: 'travel_room_stop_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'travel_room';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'travel_room_stop_user_id_fkey1';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profile';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_available_seats: { Args: { p_room_id: string }; Returns: number };
      get_travel_room_detail: {
        Args: { p_id: string };
        Returns: {
          current_stop: number;
          datetime: string;
          direction: Database['public']['Enums']['travel_direction'];
          driver: Database['public']['CompositeTypes']['driver_type'];
          id: string;
          owner_id: string;
          recurrence_rule: string;
          stops: Database['public']['CompositeTypes']['travel_room_stop_type'][];
        }[];
      };
      increment_profile_rides: { Args: { p_id: string }; Returns: undefined };
      rate_driver: {
        Args: { p_driver: string; p_rate: number };
        Returns: undefined;
      };
      search_travel_rooms: {
        Args: {
          p_date?: string;
          p_direction?: Database['public']['Enums']['travel_direction'];
          p_lat?: number;
          p_limit?: number;
          p_lon?: number;
          p_offset?: number;
          p_only_offers?: boolean;
        };
        Returns: Json;
      };
    };
    Enums: {
      location_type: 'system' | 'user';
      travel_direction: 'to_campus' | 'from_campus';
      user_role: 'passenger' | 'driver';
    };
    CompositeTypes: {
      driver_type: {
        id: string | null;
        plate: string | null;
        color: string | null;
        seats: number | null;
        rides: number | null;
        rating: number | null;
        votes: number | null;
        price: number | null;
        user_tag: string | null;
        user_avatar: string | null;
        qr_url: string | null;
      };
      travel_room_stop_type: {
        user_id: string | null;
        user_role: Database['public']['Enums']['user_role'] | null;
        stop_coords: number[] | null;
        seats: number | null;
        user_tag: string | null;
        user_avatar: string | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      location_type: ['system', 'user'],
      travel_direction: ['to_campus', 'from_campus'],
      user_role: ['passenger', 'driver'],
    },
  },
} as const;
