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
      menu_items: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_available: boolean
          is_bestseller: boolean
          is_special: boolean
          is_veg: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_bestseller?: boolean
          is_special?: boolean
          is_veg?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_bestseller?: boolean
          is_special?: boolean
          is_veg?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          item_name: string
          menu_item_id: string | null
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          item_name: string
          menu_item_id?: string | null
          order_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          item_name?: string
          menu_item_id?: string | null
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          order_code: string
          order_type: string
          payment_status: string
          pickup_code: string | null
          status: string
          table_number: string | null
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          order_code: string
          order_type: string
          payment_status?: string
          pickup_code?: string | null
          status?: string
          table_number?: string | null
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          order_code?: string
          order_type?: string
          payment_status?: string
          pickup_code?: string | null
          status?: string
          table_number?: string | null
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          order_id: string
          payment_code: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: string
          order_id: string
          payment_code: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          order_id?: string
          payment_code?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          mobile: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          mobile?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          mobile?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          guests: number
          id: string
          mobile: string
          name: string
          request: string | null
          reservation_code: string
          reserved_date: string
          reserved_time: string
          seating: string | null
          status: string
          updated_at: string
          user_id: string
          verify_code: string
        }
        Insert: {
          created_at?: string
          guests: number
          id?: string
          mobile: string
          name: string
          request?: string | null
          reservation_code: string
          reserved_date: string
          reserved_time: string
          seating?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verify_code: string
        }
        Update: {
          created_at?: string
          guests?: number
          id?: string
          mobile?: string
          name?: string
          request?: string | null
          reservation_code?: string
          reserved_date?: string
          reserved_time?: string
          seating?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verify_code?: string
        }
        Relationships: []
      }
      restaurant_tables: {
        Row: {
          capacity: number
          id: string
          status: string
          table_number: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          id?: string
          status?: string
          table_number: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          id?: string
          status?: string
          table_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_name: string
          food_rating: number | null
          id: string
          is_approved: boolean
          order_id: string | null
          overall_rating: number
          service_rating: number | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_name?: string
          food_rating?: number | null
          id?: string
          is_approved?: boolean
          order_id?: string | null
          overall_rating: number
          service_rating?: number | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_name?: string
          food_rating?: number | null
          id?: string
          is_approved?: boolean
          order_id?: string | null
          overall_rating?: number
          service_rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team: { Args: { _user_id: string }; Returns: boolean }
      pay_order: {
        Args: { _method: string; _order_id: string }
        Returns: {
          amount: number
          created_at: string
          id: string
          method: string
          order_id: string
          payment_code: string
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      place_order: {
        Args: {
          _instructions?: string
          _items: Json
          _order_type: string
          _table_number?: string
        }
        Returns: {
          created_at: string
          id: string
          instructions: string | null
          order_code: string
          order_type: string
          payment_status: string
          pickup_code: string | null
          status: string
          table_number: string | null
          total: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      verify_pickup: {
        Args: { _code: string; _order_id: string }
        Returns: boolean
      }
      verify_reservation: {
        Args: { _code: string; _reservation_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "owner" | "staff" | "kitchen"
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
  public: {
    Enums: {
      app_role: ["customer", "owner", "staff", "kitchen"],
    },
  },
} as const
