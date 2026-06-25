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
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collectors: {
        Row: {
          city: string | null
          company_name: string
          created_at: string
          id: string
          license_number: string | null
          rating: number
          service_area: string | null
          specialties: Database["public"]["Enums"]["waste_category"][] | null
          total_jobs: number
          updated_at: string
          user_id: string
          vehicle_details: string | null
          verification: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          city?: string | null
          company_name: string
          created_at?: string
          id?: string
          license_number?: string | null
          rating?: number
          service_area?: string | null
          specialties?: Database["public"]["Enums"]["waste_category"][] | null
          total_jobs?: number
          updated_at?: string
          user_id: string
          vehicle_details?: string | null
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          city?: string | null
          company_name?: string
          created_at?: string
          id?: string
          license_number?: string | null
          rating?: number
          service_area?: string | null
          specialties?: Database["public"]["Enums"]["waste_category"][] | null
          total_jobs?: number
          updated_at?: string
          user_id?: string
          vehicle_details?: string | null
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      industries: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          country: string | null
          created_at: string
          gst_number: string | null
          id: string
          industry_type: string | null
          latitude: number | null
          longitude: number | null
          state: string | null
          sustainability_score: number
          updated_at: string
          user_id: string
          verification: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          country?: string | null
          created_at?: string
          gst_number?: string | null
          id?: string
          industry_type?: string | null
          latitude?: number | null
          longitude?: number | null
          state?: string | null
          sustainability_score?: number
          updated_at?: string
          user_id: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          country?: string | null
          created_at?: string
          gst_number?: string | null
          id?: string
          industry_type?: string | null
          latitude?: number | null
          longitude?: number | null
          state?: string | null
          sustainability_score?: number
          updated_at?: string
          user_id?: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_user_id: string
        }
        Insert: {
          attachment_url?: string | null
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_user_id: string
        }
        Update: {
          attachment_url?: string | null
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          recycler_user_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          recycler_user_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          recycler_user_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_user_id: string
          created_at: string
          id: string
          notes: string | null
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          buyer_user_id: string
          created_at?: string
          id?: string
          notes?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          buyer_user_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          provider: string | null
          provider_ref: string | null
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          provider?: string | null
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          provider?: string | null
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
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
      pickup_requests: {
        Row: {
          collector_user_id: string
          created_at: string
          id: string
          industry_user_id: string
          listing_id: string
          message: string | null
          offered_price: number | null
          proof_images: string[] | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["pickup_status"]
          updated_at: string
        }
        Insert: {
          collector_user_id: string
          created_at?: string
          id?: string
          industry_user_id: string
          listing_id: string
          message?: string | null
          offered_price?: number | null
          proof_images?: string[] | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["pickup_status"]
          updated_at?: string
        }
        Update: {
          collector_user_id?: string
          created_at?: string
          id?: string
          industry_user_id?: string
          listing_id?: string
          message?: string | null
          offered_price?: number | null
          proof_images?: string[] | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["pickup_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pickup_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "waste_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          available_quantity: number
          category: Database["public"]["Enums"]["waste_category"]
          certifications: string[] | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean
          name: string
          price: number
          recycler_user_id: string
          sku: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          available_quantity?: number
          category: Database["public"]["Enums"]["waste_category"]
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          name: string
          price: number
          recycler_user_id: string
          sku?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          available_quantity?: number
          category?: Database["public"]["Enums"]["waste_category"]
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          name?: string
          price?: number
          recycler_user_id?: string
          sku?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_role: Database["public"]["Enums"]["app_role"] | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarded: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          active_role?: Database["public"]["Enums"]["app_role"] | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarded?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active_role?: Database["public"]["Enums"]["app_role"] | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recycler_inventory: {
        Row: {
          category: Database["public"]["Enums"]["waste_category"]
          created_at: string
          id: string
          notes: string | null
          quantity: number
          recycler_user_id: string
          source_listing_id: string | null
          unit: string
        }
        Insert: {
          category: Database["public"]["Enums"]["waste_category"]
          created_at?: string
          id?: string
          notes?: string | null
          quantity: number
          recycler_user_id: string
          source_listing_id?: string | null
          unit?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["waste_category"]
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number
          recycler_user_id?: string
          source_listing_id?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recycler_inventory_source_listing_id_fkey"
            columns: ["source_listing_id"]
            isOneToOne: false
            referencedRelation: "waste_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      recyclers: {
        Row: {
          certifications: string[] | null
          city: string | null
          company_name: string
          created_at: string
          id: string
          processing_capacity: string | null
          rating: number
          updated_at: string
          user_id: string
          verification: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          certifications?: string[] | null
          city?: string | null
          company_name: string
          created_at?: string
          id?: string
          processing_capacity?: string | null
          rating?: number
          updated_at?: string
          user_id: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          certifications?: string[] | null
          city?: string | null
          company_name?: string
          created_at?: string
          id?: string
          processing_capacity?: string | null
          rating?: number
          updated_at?: string
          user_id?: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      retailers: {
        Row: {
          business_type: string | null
          city: string | null
          company_name: string
          created_at: string
          gst_number: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_type?: string | null
          city?: string | null
          company_name: string
          created_at?: string
          gst_number?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_type?: string | null
          city?: string | null
          company_name?: string
          created_at?: string
          gst_number?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_user_id: string
          subject_user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_user_id: string
          subject_user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_user_id?: string
          subject_user_id?: string
        }
        Relationships: []
      }
      sustainability_reports: {
        Row: {
          carbon_saved_kg: number
          created_at: string
          diverted_from_landfill_kg: number
          id: string
          notes: string | null
          period_end: string
          period_start: string
          user_id: string
          waste_generated_kg: number
          waste_recycled_kg: number
        }
        Insert: {
          carbon_saved_kg?: number
          created_at?: string
          diverted_from_landfill_kg?: number
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          user_id: string
          waste_generated_kg?: number
          waste_recycled_kg?: number
        }
        Update: {
          carbon_saved_kg?: number
          created_at?: string
          diverted_from_landfill_kg?: number
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          user_id?: string
          waste_generated_kg?: number
          waste_recycled_kg?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waste_listings: {
        Row: {
          ai_classification: Json | null
          available_from: string | null
          category: Database["public"]["Enums"]["waste_category"]
          city: string | null
          created_at: string
          description: string | null
          estimated_value: number | null
          id: string
          images: string[] | null
          industry_user_id: string
          latitude: number | null
          longitude: number | null
          pickup_address: string | null
          pickup_deadline: string | null
          quantity: number
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          unit: string
          updated_at: string
        }
        Insert: {
          ai_classification?: Json | null
          available_from?: string | null
          category: Database["public"]["Enums"]["waste_category"]
          city?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          id?: string
          images?: string[] | null
          industry_user_id: string
          latitude?: number | null
          longitude?: number | null
          pickup_address?: string | null
          pickup_deadline?: string | null
          quantity: number
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          unit?: string
          updated_at?: string
        }
        Update: {
          ai_classification?: Json | null
          available_from?: string | null
          category?: Database["public"]["Enums"]["waste_category"]
          city?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          id?: string
          images?: string[] | null
          industry_user_id?: string
          latitude?: number | null
          longitude?: number | null
          pickup_address?: string | null
          pickup_deadline?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          unit?: string
          updated_at?: string
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
    }
    Enums: {
      app_role: "industry" | "collector" | "recycler" | "retailer" | "admin"
      listing_status:
        | "draft"
        | "active"
        | "assigned"
        | "collected"
        | "cancelled"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      pickup_status:
        | "requested"
        | "approved"
        | "rejected"
        | "scheduled"
        | "in_transit"
        | "completed"
        | "cancelled"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
      waste_category:
        | "plastic"
        | "metal"
        | "paper"
        | "glass"
        | "textile"
        | "rubber"
        | "ewaste"
        | "organic"
        | "chemical"
        | "other"
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
      app_role: ["industry", "collector", "recycler", "retailer", "admin"],
      listing_status: ["draft", "active", "assigned", "collected", "cancelled"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_status: ["pending", "paid", "failed", "refunded"],
      pickup_status: [
        "requested",
        "approved",
        "rejected",
        "scheduled",
        "in_transit",
        "completed",
        "cancelled",
      ],
      verification_status: ["unverified", "pending", "verified", "rejected"],
      waste_category: [
        "plastic",
        "metal",
        "paper",
        "glass",
        "textile",
        "rubber",
        "ewaste",
        "organic",
        "chemical",
        "other",
      ],
    },
  },
} as const
