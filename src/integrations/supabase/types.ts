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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
        }
        Relationships: []
      }
      chat_logs: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          account_manager_id: string | null
          active_package: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          industry: string | null
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          account_manager_id?: string | null
          active_package?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          account_manager_id?: string | null
          active_package?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_declarations: {
        Row: {
          company_name: string
          confidentiality_acknowledged: boolean
          declaration_date: string
          employee_name: string
          id: string
          id_number: string
          non_solicitation_months: number
          outside_employment_details: string | null
          position: string
          signature_typed_name: string
          submitted_at: string
          submitted_ip: string | null
          user_id: string
        }
        Insert: {
          company_name: string
          confidentiality_acknowledged: boolean
          declaration_date: string
          employee_name: string
          id?: string
          id_number: string
          non_solicitation_months: number
          outside_employment_details?: string | null
          position: string
          signature_typed_name: string
          submitted_at?: string
          submitted_ip?: string | null
          user_id: string
        }
        Update: {
          company_name?: string
          confidentiality_acknowledged?: boolean
          declaration_date?: string
          employee_name?: string
          id?: string
          id_number?: string
          non_solicitation_months?: number
          outside_employment_details?: string | null
          position?: string
          signature_typed_name?: string
          submitted_at?: string
          submitted_ip?: string | null
          user_id?: string
        }
        Relationships: []
      }
      glossary_terms: {
        Row: {
          definition: string
          full_definition: string | null
          how_to_steps: string[] | null
          id: string
          service_slug: string | null
          term: string
          tool_slug: string | null
          why_it_matters: string | null
        }
        Insert: {
          definition: string
          full_definition?: string | null
          how_to_steps?: string[] | null
          id?: string
          service_slug?: string | null
          term: string
          tool_slug?: string | null
          why_it_matters?: string | null
        }
        Update: {
          definition?: string
          full_definition?: string | null
          how_to_steps?: string[] | null
          id?: string
          service_slug?: string | null
          term?: string
          tool_slug?: string | null
          why_it_matters?: string | null
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          created_at: string
          end_date: string
          id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          user_id?: string
        }
        Relationships: []
      }
      monthly_reports: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          data: Json
          id: string
          prepared_by_id: string | null
          prepared_by_name: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          reporting_month: string
          reporting_period_end: string | null
          reporting_period_start: string | null
          status: Database["public"]["Enums"]["report_status"]
          status_history: Json
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          prepared_by_id?: string | null
          prepared_by_name?: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          reporting_month: string
          reporting_period_end?: string | null
          reporting_period_start?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          status_history?: Json
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          prepared_by_id?: string | null
          prepared_by_name?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          reporting_month?: string
          reporting_period_end?: string | null
          reporting_period_start?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          status_history?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_reports_prepared_by_id_fkey"
            columns: ["prepared_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          best_for: string
          id: string
          name: string
          price: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          best_for: string
          id?: string
          name: string
          price: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          best_for?: string
          id?: string
          name?: string
          price?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      pricing_items: {
        Row: {
          description: string | null
          id: string
          name: string
          price: string
          section: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          price: string
          section: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          price?: string
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: Database["public"]["Enums"]["department"] | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          job_title: string | null
          last_login_at: string | null
          onboarding_completed: boolean
          phone: string | null
          role_tier: Database["public"]["Enums"]["role_tier"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          job_title?: string | null
          last_login_at?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          role_tier?: Database["public"]["Enums"]["role_tier"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          last_login_at?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          role_tier?: Database["public"]["Enums"]["role_tier"]
        }
        Relationships: []
      }
      sales_faq: {
        Row: {
          approved_answer: string
          category: string
          id: string
          question: string
          sales_tip: string | null
        }
        Insert: {
          approved_answer: string
          category: string
          id?: string
          question: string
          sales_tip?: string | null
        }
        Update: {
          approved_answer?: string
          category?: string
          id?: string
          question?: string
          sales_tip?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          client_receives: string | null
          details: Json | null
          id: string
          name: string
          outcome: string | null
          slug: string
          sort_order: number
          tagline: string | null
          updated_at: string
          what_we_do: string | null
          who_for: string | null
        }
        Insert: {
          client_receives?: string | null
          details?: Json | null
          id?: string
          name: string
          outcome?: string | null
          slug: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
          what_we_do?: string | null
          who_for?: string | null
        }
        Update: {
          client_receives?: string | null
          details?: Json | null
          id?: string
          name?: string
          outcome?: string | null
          slug?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
          what_we_do?: string | null
          who_for?: string | null
        }
        Relationships: []
      }
      sops: {
        Row: {
          body: Json | null
          core_responsibilities: string | null
          daily_weekly_monthly: string | null
          department: Database["public"]["Enums"]["department"]
          id: string
          key_sops: string | null
          kpis: string | null
          oversees: string | null
          primary_tools: string | null
          reports_to: string | null
          role_purpose: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: Json | null
          core_responsibilities?: string | null
          daily_weekly_monthly?: string | null
          department: Database["public"]["Enums"]["department"]
          id?: string
          key_sops?: string | null
          kpis?: string | null
          oversees?: string | null
          primary_tools?: string | null
          reports_to?: string | null
          role_purpose?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: Json | null
          core_responsibilities?: string | null
          daily_weekly_monthly?: string | null
          department?: Database["public"]["Enums"]["department"]
          id?: string
          key_sops?: string | null
          kpis?: string | null
          oversees?: string | null
          primary_tools?: string | null
          reports_to?: string | null
          role_purpose?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          admin_only: boolean
          category: string | null
          how_to_use: string | null
          id: string
          login_url: string | null
          logo_url: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
          what_it_is: string | null
          who_uses: string | null
          why_we_use: string | null
        }
        Insert: {
          admin_only?: boolean
          category?: string | null
          how_to_use?: string | null
          id?: string
          login_url?: string | null
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          what_it_is?: string | null
          who_uses?: string | null
          why_we_use?: string | null
        }
        Update: {
          admin_only?: boolean
          category?: string | null
          how_to_use?: string | null
          id?: string
          login_url?: string | null
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          what_it_is?: string | null
          who_uses?: string | null
          why_we_use?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_role_tier: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["role_tier"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager_or_above: { Args: { _user_id: string }; Returns: boolean }
      is_root_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      department:
        | "CEO"
        | "Managing Director"
        | "Operations Manager"
        | "Client Relationship Manager"
        | "Sales Team"
        | "Social Media Manager"
        | "Admin Department"
        | "Human Resources"
        | "Intern"
        | "Graphics Team"
        | "Marketing Team"
        | "IT Department"
      leave_status: "pending" | "approved" | "declined"
      report_status: "draft" | "internal_review" | "sent_to_client"
      report_type:
        | "growth_strategy"
        | "ads_performance"
        | "seo_gbp"
        | "website_spec"
      role_tier: "root_admin" | "manager" | "staff" | "intern"
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
      app_role: ["admin", "user"],
      department: [
        "CEO",
        "Managing Director",
        "Operations Manager",
        "Client Relationship Manager",
        "Sales Team",
        "Social Media Manager",
        "Admin Department",
        "Human Resources",
        "Intern",
        "Graphics Team",
        "Marketing Team",
        "IT Department",
      ],
      leave_status: ["pending", "approved", "declined"],
      report_status: ["draft", "internal_review", "sent_to_client"],
      report_type: [
        "growth_strategy",
        "ads_performance",
        "seo_gbp",
        "website_spec",
      ],
      role_tier: ["root_admin", "manager", "staff", "intern"],
    },
  },
} as const
