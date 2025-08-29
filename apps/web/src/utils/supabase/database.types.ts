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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account: {
        Row: {
          accessToken: string | null
          accessTokenExpiresAt: string | null
          accountId: string
          createdAt: string
          id: string
          idToken: string | null
          password: string | null
          providerId: string
          refreshToken: string | null
          refreshTokenExpiresAt: string | null
          scope: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId: string
          createdAt: string
          id: string
          idToken?: string | null
          password?: string | null
          providerId: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt: string
          userId: string
        }
        Update: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId?: string
          createdAt?: string
          id?: string
          idToken?: string | null
          password?: string | null
          providerId?: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_activity_period: {
        Row: {
          active: boolean
          coach_id: string | null
          created_at: string
          end_date: string | null
          id: string
          payment_plan: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          coach_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          payment_plan?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          coach_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          payment_plan?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_activity_period_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activity_period_payment_plan_fkey"
            columns: ["payment_plan"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      client_assignments: {
        Row: {
          assigned_by: string | null
          assignment_type: string
          client_id: string
          coach_id: string | null
          created_at: string
          end_date: string | null
          id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          assignment_type: string
          client_id: string
          coach_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          start_date: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          assignment_type?: string
          client_id?: string
          coach_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_assignments_assigned_by_user_id_fk"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      client_goals: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          current_value: string
          description: string | null
          due_date: string
          goal_type_id: string | null
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["priority"]
          started_at: string
          status: Database["public"]["Enums"]["status"]
          target_value: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          current_value: string
          description?: string | null
          due_date: string
          goal_type_id?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          started_at: string
          status?: Database["public"]["Enums"]["status"]
          target_value: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          current_value?: string
          description?: string | null
          due_date?: string
          goal_type_id?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          started_at?: string
          status?: Database["public"]["Enums"]["status"]
          target_value?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_goals_created_by_user_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_goals_goal_type_id_goal_types_id_fk"
            columns: ["goal_type_id"]
            isOneToOne: false
            referencedRelation: "goal_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_goals_updated_by_user_id_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      client_nps: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          nps_score: number
          provided_by: string | null
          recorded_by: string | null
          recorded_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          nps_score: number
          provided_by?: string | null
          recorded_by?: string | null
          recorded_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          nps_score?: number
          provided_by?: string | null
          recorded_by?: string | null
          recorded_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_nps_provided_by_clients_id_fk"
            columns: ["provided_by"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_nps_recorded_by_user_id_fk"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      client_testimonials: {
        Row: {
          client_id: string | null
          content: string
          created_at: string
          id: string
          recorded_by: string | null
          recorded_date: string
          testimonial_type: string
          testimonial_url: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          content: string
          created_at?: string
          id?: string
          recorded_by?: string | null
          recorded_date: string
          testimonial_type: string
          testimonial_url?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          content?: string
          created_at?: string
          id?: string
          recorded_by?: string | null
          recorded_date?: string
          testimonial_type?: string
          testimonial_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_testimonials_client_id_clients_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_testimonials_recorded_by_user_id_fk"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      client_win_tags: {
        Row: {
          created_at: string
          id: string
          tag_id: string | null
          updated_at: string
          win_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          tag_id?: string | null
          updated_at?: string
          win_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          tag_id?: string | null
          updated_at?: string
          win_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_win_tags_tag_id_win_tags_id_fk"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "win_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_win_tags_win_id_client_wins_id_fk"
            columns: ["win_id"]
            isOneToOne: false
            referencedRelation: "client_wins"
            referencedColumns: ["id"]
          },
        ]
      }
      client_wins: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          recorded_by: string | null
          title: string
          updated_at: string
          win_date: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          recorded_by?: string | null
          title: string
          updated_at?: string
          win_date: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          recorded_by?: string | null
          title?: string
          updated_at?: string
          win_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_wins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_wins_recorded_by_user_id_fk"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string
          everfit_access: Database["public"]["Enums"]["everfit_access"] | null
          id: string
          name: string
          offboard_date: string | null
          onboarding_call_completed: boolean
          onboarding_completed_date: string | null
          onboarding_notes: string | null
          overall_status:
            | Database["public"]["Enums"]["client_overall_status"]
            | null
          phone: string
          team_ids: string | null
          two_week_check_in_call_completed: boolean
          updated_at: string
          vip_terms_signed: boolean
        }
        Insert: {
          created_at?: string
          email: string
          everfit_access?: Database["public"]["Enums"]["everfit_access"] | null
          id?: string
          name: string
          offboard_date?: string | null
          onboarding_call_completed?: boolean
          onboarding_completed_date?: string | null
          onboarding_notes?: string | null
          overall_status?:
            | Database["public"]["Enums"]["client_overall_status"]
            | null
          phone: string
          team_ids?: string | null
          two_week_check_in_call_completed?: boolean
          updated_at?: string
          vip_terms_signed?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          everfit_access?: Database["public"]["Enums"]["everfit_access"] | null
          id?: string
          name?: string
          offboard_date?: string | null
          onboarding_call_completed?: boolean
          onboarding_completed_date?: string | null
          onboarding_notes?: string | null
          overall_status?:
            | Database["public"]["Enums"]["client_overall_status"]
            | null
          phone?: string
          team_ids?: string | null
          two_week_check_in_call_completed?: boolean
          updated_at?: string
          vip_terms_signed?: boolean
        }
        Relationships: []
      }
      coach_capacity: {
        Row: {
          coach_id: string | null
          created_at: string
          id: string
          max_client_units: number
          max_total_clients: number
          updated_at: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          id?: string
          max_client_units: number
          max_total_clients: number
          updated_at?: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          id?: string
          max_client_units?: number
          max_total_clients?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_capacity_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_payments: {
        Row: {
          amount: number
          client_activity_period_id: string | null
          coach_id: string | null
          created_at: string
          date: string | null
          id: string
          status:
            | Database["public"]["Enums"]["coach_payment_status_enum"]
            | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_activity_period_id?: string | null
          coach_id?: string | null
          created_at?: string
          date?: string | null
          id?: string
          status?:
            | Database["public"]["Enums"]["coach_payment_status_enum"]
            | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_activity_period_id?: string | null
          coach_id?: string | null
          created_at?: string
          date?: string | null
          id?: string
          status?:
            | Database["public"]["Enums"]["coach_payment_status_enum"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_payments_client_activity_period_id_client_activity_period"
            columns: ["client_activity_period_id"]
            isOneToOne: false
            referencedRelation: "client_activity_period"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_payments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_teams: {
        Row: {
          coach_id: string | null
          created_at: string
          id: string
          premier_coach_id: string | null
          team_name: string | null
          updated_at: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          id?: string
          premier_coach_id?: string | null
          team_name?: string | null
          updated_at?: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          id?: string
          premier_coach_id?: string | null
          team_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_teams_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_teams_premier_coach_id_fkey"
            columns: ["premier_coach_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_settings: {
        Row: {
          created_at: string
          created_by: string | null
          effective_date: string
          id: string
          setting_name: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_date: string
          id?: string
          setting_name: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          setting_name?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_settings_created_by_user_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      goal_types: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string
          default_duration_days: number
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          is_measurable: boolean
          name: string
          unit_of_measures: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_at?: string
          default_duration_days: number
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_measurable?: boolean
          name: string
          unit_of_measures?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_at?: string
          default_duration_days?: number
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_measurable?: boolean
          name?: string
          unit_of_measures?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_types_category_id_goal_categories_id_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "goal_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      passkey: {
        Row: {
          aaguid: string | null
          backedUp: boolean
          counter: number
          createdAt: string | null
          credentialID: string
          deviceType: string
          id: string
          name: string | null
          publicKey: string
          transports: string | null
          userId: string
        }
        Insert: {
          aaguid?: string | null
          backedUp: boolean
          counter: number
          createdAt?: string | null
          credentialID: string
          deviceType: string
          id: string
          name?: string | null
          publicKey: string
          transports?: string | null
          userId: string
        }
        Update: {
          aaguid?: string | null
          backedUp?: boolean
          counter?: number
          createdAt?: string | null
          credentialID?: string
          deviceType?: string
          id?: string
          name?: string | null
          publicKey?: string
          transports?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "passkey_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plan_template_slots: {
        Row: {
          amount_due: number
          created_at: string
          id: string
          months_to_delay: number
          payment_plan_template_id: string
          updated_at: string
        }
        Insert: {
          amount_due: number
          created_at?: string
          id?: string
          months_to_delay?: number
          payment_plan_template_id: string
          updated_at?: string
        }
        Update: {
          amount_due?: number
          created_at?: string
          id?: string
          months_to_delay?: number
          payment_plan_template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_plan_template_items_payment_plan_template_id_payment_pl"
            columns: ["payment_plan_template_id"]
            isOneToOne: false
            referencedRelation: "payment_plan_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plan_templates: {
        Row: {
          created_at: string
          id: string
          name: string
          product_id: string
          program_length_months: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          product_id: string
          program_length_months?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          product_id?: string
          program_length_months?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_plan_templates_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plans: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          platform: string | null
          product_id: string | null
          subscription_id: string | null
          term_end_date: string
          term_start_date: string
          total_amount: number | null
          total_amount_paid: number | null
          type: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          platform?: string | null
          product_id?: string | null
          subscription_id?: string | null
          term_end_date: string
          term_start_date: string
          total_amount?: number | null
          total_amount_paid?: number | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          platform?: string | null
          product_id?: string | null
          subscription_id?: string | null
          term_end_date?: string
          term_start_date?: string
          total_amount?: number | null
          total_amount_paid?: number | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "payment_plan_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_slots: {
        Row: {
          amount_due: number
          amount_paid: number
          created_at: string
          due_date: string
          id: string
          notes: string | null
          payment_id: string | null
          plan_id: string | null
          updated_at: string
        }
        Insert: {
          amount_due: number
          amount_paid?: number
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          plan_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          plan_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_slots_payment_id_payments_id_fk"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_slots_plan_id_payment_plans_id_fk"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string
          declined_at: string | null
          dispute_fee: number | null
          disputed_status: Database["public"]["Enums"]["disputed_status"] | null
          id: string
          payment_date: string | null
          payment_method: string | null
          platform: string | null
          status: string | null
          stripe_transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          declined_at?: string | null
          dispute_fee?: number | null
          disputed_status?:
            | Database["public"]["Enums"]["disputed_status"]
            | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          platform?: string | null
          status?: string | null
          stripe_transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          declined_at?: string | null
          dispute_fee?: number | null
          disputed_status?:
            | Database["public"]["Enums"]["disputed_status"]
            | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          platform?: string | null
          status?: string | null
          stripe_transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          client_unit: number | null
          created_at: string
          default_duration_months: number | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          client_unit?: number | null
          created_at?: string
          default_duration_months?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          client_unit?: number | null
          created_at?: string
          default_duration_months?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          permissions: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      session: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          impersonatedBy: string | null
          ipAddress: string | null
          token: string
          updatedAt: string
          userAgent: string | null
          userId: string
        }
        Insert: {
          createdAt: string
          expiresAt: string
          id: string
          impersonatedBy?: string | null
          ipAddress?: string | null
          token: string
          updatedAt: string
          userAgent?: string | null
          userId: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          impersonatedBy?: string | null
          ipAddress?: string | null
          token?: string
          updatedAt?: string
          userAgent?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          contract_type:
            | Database["public"]["Enums"]["contract_type_enum"]
            | null
          created_at: string
          "Fake Data?": boolean | null
          id: string
          name: string | null
          onboarding_date: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          contract_type?:
            | Database["public"]["Enums"]["contract_type_enum"]
            | null
          created_at?: string
          "Fake Data?"?: boolean | null
          id?: string
          name?: string | null
          onboarding_date?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          contract_type?:
            | Database["public"]["Enums"]["contract_type_enum"]
            | null
          created_at?: string
          "Fake Data?"?: boolean | null
          id?: string
          name?: string | null
          onboarding_date?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "coach_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          banExpires: string | null
          banned: boolean | null
          banReason: string | null
          bio: string | null
          calendar_link: string | null
          createdAt: string
          email: string
          emailVerified: boolean
          id: string
          image: string | null
          name: string
          role: string | null
          updatedAt: string
        }
        Insert: {
          banExpires?: string | null
          banned?: boolean | null
          banReason?: string | null
          bio?: string | null
          calendar_link?: string | null
          createdAt: string
          email: string
          emailVerified: boolean
          id: string
          image?: string | null
          name: string
          role?: string | null
          updatedAt: string
        }
        Update: {
          banExpires?: string | null
          banned?: boolean | null
          banReason?: string | null
          bio?: string | null
          calendar_link?: string | null
          createdAt?: string
          email?: string
          emailVerified?: boolean
          id?: string
          image?: string | null
          name?: string
          role?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      verification: {
        Row: {
          createdAt: string | null
          expiresAt: string
          id: string
          identifier: string
          updatedAt: string | null
          value: string
        }
        Insert: {
          createdAt?: string | null
          expiresAt: string
          id: string
          identifier: string
          updatedAt?: string | null
          value: string
        }
        Update: {
          createdAt?: string | null
          expiresAt?: string
          id?: string
          identifier?: string
          updatedAt?: string | null
          value?: string
        }
        Relationships: []
      }
      win_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_client_units: {
        Args: { client_uuid: string }
        Returns: number
      }
      current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_subscriptions_by_type: {
        Args: Record<PropertyKey, never>
        Returns: {
          subscription_count: number
          subscription_type: string
        }[]
      }
      get_client_id_from_record: {
        Args: { record_data: Json; table_name: string }
        Returns: string
      }
      get_stripe_customers: {
        Args: { limit_count?: number }
        Returns: {
          customer_id: string
          email: string
          id: string
          name: string
        }[]
      }
      get_stripe_customers_test: {
        Args: Record<PropertyKey, never>
        Returns: {
          created: string
          description: string
          email: string
          id: string
          name: string
        }[]
      }
      get_stripe_financial_metrics: {
        Args: {
          p_end_date?: string
          p_previous_period_days?: number
          p_start_date?: string
        }
        Returns: Json
      }
      get_stripe_sales_performance: {
        Args: { p_days?: number }
        Returns: Json
      }
      set_user_id: {
        Args: { user_id: string }
        Returns: undefined
      }
      trigger_client_unit_webhook: {
        Args: { client_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      audit_action_enum: "INSERT" | "UPDATE" | "DELETE"
      call_type_enum: "onboarding" | "check_in" | "monthly" | "other"
      client_overall_status: "new" | "live" | "paused" | "churned"
      coach_payment_status_enum: "Paid" | "Not Paid"
      contract_type_enum: "W2" | "Hourly"
      disputed_status:
        | "Not Disputed"
        | "Disputed"
        | "Evidence Submtited"
        | "Dispute Won"
        | "Dispute Lost"
      everfit_access: "new" | "requested" | "confirmed"
      payment_frequency_enum: "monthly" | "bi_weekly" | "weekly" | "one_time"
      payment_plan_frequency: "PIF" | "2-Pay" | "Split Pay" | "4-Pay" | "CUSTOM"
      payment_status_enum: "pending" | "completed" | "failed" | "refunded"
      priority: "high" | "medium" | "low"
      status: "pending" | "in_progress" | "completed" | "cancelled" | "overdue"
      testimonial_type_enum: "video" | "text" | "google_review" | "other"
      ticket_priority_enum: "low" | "medium" | "high" | "urgent"
      ticket_status_enum:
        | "open"
        | "in_progress"
        | "resolved"
        | "closed"
        | "paused"
      ticket_type_enum:
        | "billing"
        | "tech_problem"
        | "escalation"
        | "coaching_transfer"
        | "retention"
        | "pausing"
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
      audit_action_enum: ["INSERT", "UPDATE", "DELETE"],
      call_type_enum: ["onboarding", "check_in", "monthly", "other"],
      client_overall_status: ["new", "live", "paused", "churned"],
      coach_payment_status_enum: ["Paid", "Not Paid"],
      contract_type_enum: ["W2", "Hourly"],
      disputed_status: [
        "Not Disputed",
        "Disputed",
        "Evidence Submtited",
        "Dispute Won",
        "Dispute Lost",
      ],
      everfit_access: ["new", "requested", "confirmed"],
      payment_frequency_enum: ["monthly", "bi_weekly", "weekly", "one_time"],
      payment_plan_frequency: ["PIF", "2-Pay", "Split Pay", "4-Pay", "CUSTOM"],
      payment_status_enum: ["pending", "completed", "failed", "refunded"],
      priority: ["high", "medium", "low"],
      status: ["pending", "in_progress", "completed", "cancelled", "overdue"],
      testimonial_type_enum: ["video", "text", "google_review", "other"],
      ticket_priority_enum: ["low", "medium", "high", "urgent"],
      ticket_status_enum: [
        "open",
        "in_progress",
        "resolved",
        "closed",
        "paused",
      ],
      ticket_type_enum: [
        "billing",
        "tech_problem",
        "escalation",
        "coaching_transfer",
        "retention",
        "pausing",
        "other",
      ],
    },
  },
} as const
