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
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["user_id"]
          },
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
          coach_payment: string | null
          created_at: string
          end_date: string | null
          id: string
          payment_plan: string | null
          payment_slot: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          coach_id?: string | null
          coach_payment?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          payment_plan?: string | null
          payment_slot?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          coach_id?: string | null
          coach_payment?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          payment_plan?: string | null
          payment_slot?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_activity_period_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "client_activity_period_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activity_period_coach_payment_fkey"
            columns: ["coach_payment"]
            isOneToOne: false
            referencedRelation: "coach_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activity_period_coach_payment_fkey"
            columns: ["coach_payment"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["coach_payment_id"]
          },
          {
            foreignKeyName: "client_activity_period_payment_plan_fkey"
            columns: ["payment_plan"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "client_activity_period_payment_plan_fkey"
            columns: ["payment_plan"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activity_period_payment_plan_fkey"
            columns: ["payment_plan"]
            isOneToOne: false
            referencedRelation: "payments_with_details"
            referencedColumns: ["payment_plan_id"]
          },
          {
            foreignKeyName: "client_activity_period_payment_slot_fkey"
            columns: ["payment_slot"]
            isOneToOne: false
            referencedRelation: "payment_slots"
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
            foreignKeyName: "client_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "client_assignments_assigned_by_fkey"
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
            foreignKeyName: "client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "payments_with_details"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_assignments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["coach_id"]
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
      client_emails: {
        Row: {
          client_id: string | null
          created_at: string
          email: string | null
          id: number
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          email?: string | null
          id?: number
        }
        Update: {
          client_id?: string | null
          created_at?: string
          email?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "payments_with_details"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["client_id"]
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
            foreignKeyName: "client_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "payments_with_details"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_goals_created_by_user_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["user_id"]
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
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["user_id"]
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
            foreignKeyName: "client_nps_provided_by_clients_id_fk"
            columns: ["provided_by"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_nps_provided_by_clients_id_fk"
            columns: ["provided_by"]
            isOneToOne: false
            referencedRelation: "payments_with_details"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_nps_provided_by_clients_id_fk"
            columns: ["provided_by"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_nps_recorded_by_user_id_fk"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["user_id"]
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
          testimonial_type: Database["public"]["Enums"]["testimonial_type_enum"]
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
          testimonial_type: Database["public"]["Enums"]["testimonial_type_enum"]
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
          testimonial_type?: Database["public"]["Enums"]["testimonial_type_enum"]
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
            foreignKeyName: "client_testimonials_client_id_clients_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_testimonials_client_id_clients_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "payments_with_details"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_testimonials_client_id_clients_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_testimonials_recorded_by_user_id_fk"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["user_id"]
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
            foreignKeyName: "client_wins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_wins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "payments_with_details"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_wins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_wins_recorded_by_user_id_fk"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["user_id"]
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
          import: boolean | null
          is_deleted: boolean | null
          name: string
          offboard_date: string | null
          onboarding_call_completed: boolean
          onboarding_completed_date: string | null
          onboarding_notes: string | null
          overall_status:
            | Database["public"]["Enums"]["client_overall_status"]
            | null
          phone: string
          possible_duplicate: boolean | null
          two_week_check_in_call_completed: boolean
          updated_at: string
          vip_terms_signed: boolean
        }
        Insert: {
          created_at?: string
          email: string
          everfit_access?: Database["public"]["Enums"]["everfit_access"] | null
          id?: string
          import?: boolean | null
          is_deleted?: boolean | null
          name: string
          offboard_date?: string | null
          onboarding_call_completed?: boolean
          onboarding_completed_date?: string | null
          onboarding_notes?: string | null
          overall_status?:
            | Database["public"]["Enums"]["client_overall_status"]
            | null
          phone: string
          possible_duplicate?: boolean | null
          two_week_check_in_call_completed?: boolean
          updated_at?: string
          vip_terms_signed?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          everfit_access?: Database["public"]["Enums"]["everfit_access"] | null
          id?: string
          import?: boolean | null
          is_deleted?: boolean | null
          name?: string
          offboard_date?: string | null
          onboarding_call_completed?: boolean
          onboarding_completed_date?: string | null
          onboarding_notes?: string | null
          overall_status?:
            | Database["public"]["Enums"]["client_overall_status"]
            | null
          phone?: string
          possible_duplicate?: boolean | null
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
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["coach_id"]
          },
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
            foreignKeyName: "coach_payments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["coach_id"]
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
          created_at: string
          id: string
          premier_coach_id: string | null
          team_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          premier_coach_id?: string | null
          team_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          premier_coach_id?: string | null
          team_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_teams_premier_coach_id_fkey"
            columns: ["premier_coach_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["coach_id"]
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
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["user_id"]
          },
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
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["user_id"]
          },
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
          payment_plan_template_id: string | null
          updated_at: string
        }
        Insert: {
          amount_due: number
          created_at?: string
          id?: string
          months_to_delay?: number
          payment_plan_template_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_due?: number
          created_at?: string
          id?: string
          months_to_delay?: number
          payment_plan_template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_plan_template_slots_payment_plan_template_id_fkey"
            columns: ["payment_plan_template_id"]
            isOneToOne: false
            referencedRelation: "payment_plan_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plan_template_slots_payment_plan_template_id_fkey"
            columns: ["payment_plan_template_id"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["ppt_id"]
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
            foreignKeyName: "payment_plan_templates_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "payment_plan_templates_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plan_templates_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["product_id"]
          },
        ]
      }
      payment_plans: {
        Row: {
          client_id: string | null
          closer_id: string | null
          created_at: string
          id: string
          notes: string | null
          product_id: string | null
          product_links: string | null
          setter_id: string | null
          subscription_id: string | null
          term_end_date: string
          term_start_date: string
          type: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          closer_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          product_links?: string | null
          setter_id?: string | null
          subscription_id?: string | null
          term_end_date: string
          term_start_date: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          closer_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          product_links?: string | null
          setter_id?: string | null
          subscription_id?: string | null
          term_end_date?: string
          term_start_date?: string
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
            foreignKeyName: "payment_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "payments_with_details"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_plans_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "payment_plans_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "payment_plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "payment_plans_setter_id_fkey"
            columns: ["setter_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "payment_plans_setter_id_fkey"
            columns: ["setter_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "payment_plan_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["ppt_id"]
          },
        ]
      }
      payment_slots: {
        Row: {
          amount_due: number
          created_at: string
          due_date: string
          id: string
          notes: string | null
          plan_id: string | null
          updated_at: string
        }
        Insert: {
          amount_due: number
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          plan_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_due?: number
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          plan_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_slots_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "payment_slots_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_slots_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "payments_with_details"
            referencedColumns: ["payment_plan_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          client_email: number | null
          closer_id: string | null
          closer_id_temp: number | null
          created_at: string
          declined_at: string | null
          description: string | null
          dispute_fee: number | null
          disputed_status: Database["public"]["Enums"]["disputed_status"] | null
          id: string
          invoiced_at: string | null
          payment_date: string | null
          payment_method: string | null
          payment_name: string | null
          payment_slot_id: string | null
          platform: string | null
          platform_fees: number | null
          status: string | null
          stripe_transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          client_email?: number | null
          closer_id?: string | null
          closer_id_temp?: number | null
          created_at?: string
          declined_at?: string | null
          description?: string | null
          dispute_fee?: number | null
          disputed_status?:
            | Database["public"]["Enums"]["disputed_status"]
            | null
          id?: string
          invoiced_at?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_name?: string | null
          payment_slot_id?: string | null
          platform?: string | null
          platform_fees?: number | null
          status?: string | null
          stripe_transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          client_email?: number | null
          closer_id?: string | null
          closer_id_temp?: number | null
          created_at?: string
          declined_at?: string | null
          description?: string | null
          dispute_fee?: number | null
          disputed_status?:
            | Database["public"]["Enums"]["disputed_status"]
            | null
          id?: string
          invoiced_at?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_name?: string | null
          payment_slot_id?: string | null
          platform?: string | null
          platform_fees?: number | null
          status?: string | null
          stripe_transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_email_fkey"
            columns: ["client_email"]
            isOneToOne: false
            referencedRelation: "client_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "payments_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_slot_id_fkey"
            columns: ["payment_slot_id"]
            isOneToOne: false
            referencedRelation: "payment_slots"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["user_id"]
          },
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
          onboarding_link: string | null
          team_id: string | null
          updated_at: string | null
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
          onboarding_link?: string | null
          team_id?: string | null
          updated_at?: string | null
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
          onboarding_link?: string | null
          team_id?: string | null
          updated_at?: string | null
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
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["user_id"]
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
      coach_payments_list_view: {
        Row: {
          amount: number | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          coach_email: string | null
          coach_id: string | null
          coach_name: string | null
          coach_payment_id: string | null
          contract_type:
            | Database["public"]["Enums"]["contract_type_enum"]
            | null
          created_at: string | null
          date: string | null
          number_of_activity_periods: number | null
          onboarding_date: string | null
          plan_id: string | null
          product_id: string | null
          product_name: string | null
          status:
            | Database["public"]["Enums"]["coach_payment_status_enum"]
            | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      payments_with_details: {
        Row: {
          amount_due: number | null
          balance_amount: number | null
          balance_fee: number | null
          balance_net: number | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          created_at: string | null
          declined_at: string | null
          dispute_fee: number | null
          disputed_status: Database["public"]["Enums"]["disputed_status"] | null
          id: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_method: string | null
          payment_plan_id: string | null
          payment_slot_id: string | null
          plan_type: string | null
          platform: string | null
          product_id: string | null
          product_name: string | null
          duration: number | null
          slot_due_date: string | null
          slot_notes: string | null
          status: string | null
          stripe_charge_amount: number | null
          stripe_transaction_id: string | null
          term_end_date: string | null
          term_start_date: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "payment_plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "payment_plans_type_fkey"
            columns: ["plan_type"]
            isOneToOne: false
            referencedRelation: "payment_plan_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_type_fkey"
            columns: ["plan_type"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["ppt_id"]
          },
          {
            foreignKeyName: "payments_payment_slot_id_fkey"
            columns: ["payment_slot_id"]
            isOneToOne: false
            referencedRelation: "payment_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      v_client_activity_period_core: {
        Row: {
          active: boolean | null
          client_id: string | null
          client_name: string | null
          coach_id: string | null
          coach_name: string | null
          created_at: string | null
          end_date: string | null
          id: string | null
          payment_plan: string | null
          ppt_created_at: string | null
          ppt_id: string | null
          ppt_name: string | null
          ppt_product_id: string | null
          ppt_program_length_months: number | null
          ppt_updated_at: string | null
          product_id: string | null
          product_name: string | null
          start_date: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_activity_period_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["coach_id"]
          },
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
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "client_activity_period_payment_plan_fkey"
            columns: ["payment_plan"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activity_period_payment_plan_fkey"
            columns: ["payment_plan"]
            isOneToOne: false
            referencedRelation: "payments_with_details"
            referencedColumns: ["payment_plan_id"]
          },
          {
            foreignKeyName: "payment_plan_templates_product_id_fkey"
            columns: ["ppt_product_id"]
            isOneToOne: false
            referencedRelation: "coach_payments_list_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "payment_plan_templates_product_id_fkey"
            columns: ["ppt_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plan_templates_product_id_fkey"
            columns: ["ppt_product_id"]
            isOneToOne: false
            referencedRelation: "v_client_activity_period_core"
            referencedColumns: ["product_id"]
          },
        ]
      }
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
      client_overall_status:
        | "new"
        | "live"
        | "paused"
        | "churned"
        | "ready_for_coach_assignment"
        | "offboarding"
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
      testimonial_type_enum: "written" | "email" | "video"
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
  stripe: {
    Tables: {
      balance_transactions: {
        Row: {
          amount: number | null
          created_at: string
          fee: number | null
          id: string
          net: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          fee?: number | null
          id: string
          net?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          fee?: number | null
          id?: string
          net?: number | null
        }
        Relationships: []
      }
      charges: {
        Row: {
          amount: number | null
          amount_refunded: number | null
          application: string | null
          application_fee: string | null
          balance_transaction: string | null
          captured: boolean | null
          created: number | null
          currency: string | null
          customer: string | null
          description: string | null
          destination: string | null
          dispute: string | null
          failure_code: string | null
          failure_message: string | null
          fraud_details: Json | null
          id: string
          invoice: string | null
          livemode: boolean | null
          metadata: Json | null
          object: string | null
          on_behalf_of: string | null
          order: string | null
          outcome: Json | null
          paid: boolean | null
          payment_intent: string | null
          payment_method_details: Json | null
          receipt_email: string | null
          receipt_number: string | null
          refunded: boolean | null
          refunds: Json | null
          review: string | null
          shipping: Json | null
          source: Json | null
          source_transfer: string | null
          statement_descriptor: string | null
          status: string | null
          transfer_group: string | null
          updated: number | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          amount_refunded?: number | null
          application?: string | null
          application_fee?: string | null
          balance_transaction?: string | null
          captured?: boolean | null
          created?: number | null
          currency?: string | null
          customer?: string | null
          description?: string | null
          destination?: string | null
          dispute?: string | null
          failure_code?: string | null
          failure_message?: string | null
          fraud_details?: Json | null
          id: string
          invoice?: string | null
          livemode?: boolean | null
          metadata?: Json | null
          object?: string | null
          on_behalf_of?: string | null
          order?: string | null
          outcome?: Json | null
          paid?: boolean | null
          payment_intent?: string | null
          payment_method_details?: Json | null
          receipt_email?: string | null
          receipt_number?: string | null
          refunded?: boolean | null
          refunds?: Json | null
          review?: string | null
          shipping?: Json | null
          source?: Json | null
          source_transfer?: string | null
          statement_descriptor?: string | null
          status?: string | null
          transfer_group?: string | null
          updated?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          amount_refunded?: number | null
          application?: string | null
          application_fee?: string | null
          balance_transaction?: string | null
          captured?: boolean | null
          created?: number | null
          currency?: string | null
          customer?: string | null
          description?: string | null
          destination?: string | null
          dispute?: string | null
          failure_code?: string | null
          failure_message?: string | null
          fraud_details?: Json | null
          id?: string
          invoice?: string | null
          livemode?: boolean | null
          metadata?: Json | null
          object?: string | null
          on_behalf_of?: string | null
          order?: string | null
          outcome?: Json | null
          paid?: boolean | null
          payment_intent?: string | null
          payment_method_details?: Json | null
          receipt_email?: string | null
          receipt_number?: string | null
          refunded?: boolean | null
          refunds?: Json | null
          review?: string | null
          shipping?: Json | null
          source?: Json | null
          source_transfer?: string | null
          statement_descriptor?: string | null
          status?: string | null
          transfer_group?: string | null
          updated?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          amount_off: number | null
          created: number | null
          currency: string | null
          duration: string | null
          duration_in_months: number | null
          id: string
          livemode: boolean | null
          max_redemptions: number | null
          metadata: Json | null
          name: string | null
          object: string | null
          percent_off: number | null
          percent_off_precise: number | null
          redeem_by: number | null
          times_redeemed: number | null
          updated: number | null
          updated_at: string
          valid: boolean | null
        }
        Insert: {
          amount_off?: number | null
          created?: number | null
          currency?: string | null
          duration?: string | null
          duration_in_months?: number | null
          id: string
          livemode?: boolean | null
          max_redemptions?: number | null
          metadata?: Json | null
          name?: string | null
          object?: string | null
          percent_off?: number | null
          percent_off_precise?: number | null
          redeem_by?: number | null
          times_redeemed?: number | null
          updated?: number | null
          updated_at?: string
          valid?: boolean | null
        }
        Update: {
          amount_off?: number | null
          created?: number | null
          currency?: string | null
          duration?: string | null
          duration_in_months?: number | null
          id?: string
          livemode?: boolean | null
          max_redemptions?: number | null
          metadata?: Json | null
          name?: string | null
          object?: string | null
          percent_off?: number | null
          percent_off_precise?: number | null
          redeem_by?: number | null
          times_redeemed?: number | null
          updated?: number | null
          updated_at?: string
          valid?: boolean | null
        }
        Relationships: []
      }
      credit_notes: {
        Row: {
          amount: number | null
          amount_shipping: number | null
          created: number | null
          currency: string | null
          customer: string | null
          customer_balance_transaction: string | null
          discount_amount: number | null
          discount_amounts: Json | null
          id: string
          invoice: string | null
          lines: Json | null
          livemode: boolean | null
          memo: string | null
          metadata: Json | null
          number: string | null
          object: string | null
          out_of_band_amount: number | null
          pdf: string | null
          reason: string | null
          refund: string | null
          shipping_cost: Json | null
          status: string | null
          subtotal: number | null
          subtotal_excluding_tax: number | null
          tax_amounts: Json | null
          total: number | null
          total_excluding_tax: number | null
          type: string | null
          voided_at: string | null
        }
        Insert: {
          amount?: number | null
          amount_shipping?: number | null
          created?: number | null
          currency?: string | null
          customer?: string | null
          customer_balance_transaction?: string | null
          discount_amount?: number | null
          discount_amounts?: Json | null
          id: string
          invoice?: string | null
          lines?: Json | null
          livemode?: boolean | null
          memo?: string | null
          metadata?: Json | null
          number?: string | null
          object?: string | null
          out_of_band_amount?: number | null
          pdf?: string | null
          reason?: string | null
          refund?: string | null
          shipping_cost?: Json | null
          status?: string | null
          subtotal?: number | null
          subtotal_excluding_tax?: number | null
          tax_amounts?: Json | null
          total?: number | null
          total_excluding_tax?: number | null
          type?: string | null
          voided_at?: string | null
        }
        Update: {
          amount?: number | null
          amount_shipping?: number | null
          created?: number | null
          currency?: string | null
          customer?: string | null
          customer_balance_transaction?: string | null
          discount_amount?: number | null
          discount_amounts?: Json | null
          id?: string
          invoice?: string | null
          lines?: Json | null
          livemode?: boolean | null
          memo?: string | null
          metadata?: Json | null
          number?: string | null
          object?: string | null
          out_of_band_amount?: number | null
          pdf?: string | null
          reason?: string | null
          refund?: string | null
          shipping_cost?: Json | null
          status?: string | null
          subtotal?: number | null
          subtotal_excluding_tax?: number | null
          tax_amounts?: Json | null
          total?: number | null
          total_excluding_tax?: number | null
          type?: string | null
          voided_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: Json | null
          balance: number | null
          created: number | null
          currency: string | null
          default_source: string | null
          deleted: boolean
          delinquent: boolean | null
          description: string | null
          discount: Json | null
          email: string | null
          id: string
          invoice_prefix: string | null
          invoice_settings: Json | null
          livemode: boolean | null
          metadata: Json | null
          name: string | null
          next_invoice_sequence: number | null
          object: string | null
          phone: string | null
          preferred_locales: Json | null
          shipping: Json | null
          tax_exempt: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          balance?: number | null
          created?: number | null
          currency?: string | null
          default_source?: string | null
          deleted?: boolean
          delinquent?: boolean | null
          description?: string | null
          discount?: Json | null
          email?: string | null
          id: string
          invoice_prefix?: string | null
          invoice_settings?: Json | null
          livemode?: boolean | null
          metadata?: Json | null
          name?: string | null
          next_invoice_sequence?: number | null
          object?: string | null
          phone?: string | null
          preferred_locales?: Json | null
          shipping?: Json | null
          tax_exempt?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          balance?: number | null
          created?: number | null
          currency?: string | null
          default_source?: string | null
          deleted?: boolean
          delinquent?: boolean | null
          description?: string | null
          discount?: Json | null
          email?: string | null
          id?: string
          invoice_prefix?: string | null
          invoice_settings?: Json | null
          livemode?: boolean | null
          metadata?: Json | null
          name?: string | null
          next_invoice_sequence?: number | null
          object?: string | null
          phone?: string | null
          preferred_locales?: Json | null
          shipping?: Json | null
          tax_exempt?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          amount: number | null
          balance_transactions: Json | null
          charge: string | null
          created: number | null
          currency: string | null
          evidence: Json | null
          evidence_details: Json | null
          id: string
          is_charge_refundable: boolean | null
          livemode: boolean | null
          metadata: Json | null
          object: string | null
          payment_intent: string | null
          reason: string | null
          status: string | null
          updated: number | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          balance_transactions?: Json | null
          charge?: string | null
          created?: number | null
          currency?: string | null
          evidence?: Json | null
          evidence_details?: Json | null
          id: string
          is_charge_refundable?: boolean | null
          livemode?: boolean | null
          metadata?: Json | null
          object?: string | null
          payment_intent?: string | null
          reason?: string | null
          status?: string | null
          updated?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          balance_transactions?: Json | null
          charge?: string | null
          created?: number | null
          currency?: string | null
          evidence?: Json | null
          evidence_details?: Json | null
          id?: string
          is_charge_refundable?: boolean | null
          livemode?: boolean | null
          metadata?: Json | null
          object?: string | null
          payment_intent?: string | null
          reason?: string | null
          status?: string | null
          updated?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      early_fraud_warnings: {
        Row: {
          actionable: boolean | null
          charge: string | null
          created: number | null
          fraud_type: string | null
          id: string
          livemode: boolean | null
          object: string | null
          payment_intent: string | null
          updated_at: string
        }
        Insert: {
          actionable?: boolean | null
          charge?: string | null
          created?: number | null
          fraud_type?: string | null
          id: string
          livemode?: boolean | null
          object?: string | null
          payment_intent?: string | null
          updated_at?: string
        }
        Update: {
          actionable?: boolean | null
          charge?: string | null
          created?: number | null
          fraud_type?: string | null
          id?: string
          livemode?: boolean | null
          object?: string | null
          payment_intent?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          api_version: string | null
          created: number | null
          data: Json | null
          id: string
          livemode: boolean | null
          object: string | null
          pending_webhooks: number | null
          request: string | null
          type: string | null
          updated: number | null
          updated_at: string
        }
        Insert: {
          api_version?: string | null
          created?: number | null
          data?: Json | null
          id: string
          livemode?: boolean | null
          object?: string | null
          pending_webhooks?: number | null
          request?: string | null
          type?: string | null
          updated?: number | null
          updated_at?: string
        }
        Update: {
          api_version?: string | null
          created?: number | null
          data?: Json | null
          id?: string
          livemode?: boolean | null
          object?: string | null
          pending_webhooks?: number | null
          request?: string | null
          type?: string | null
          updated?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          account_country: string | null
          account_name: string | null
          account_tax_ids: Json | null
          amount_due: number | null
          amount_paid: number | null
          amount_remaining: number | null
          application_fee_amount: number | null
          attempt_count: number | null
          attempted: boolean | null
          auto_advance: boolean | null
          billing_reason: string | null
          charge: string | null
          collection_method: string | null
          created: number | null
          currency: string | null
          custom_fields: Json | null
          customer: string | null
          customer_address: Json | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_shipping: Json | null
          customer_tax_exempt: string | null
          customer_tax_ids: Json | null
          default_payment_method: string | null
          default_source: string | null
          default_tax_rates: Json | null
          description: string | null
          discount: Json | null
          discounts: Json | null
          due_date: number | null
          ending_balance: number | null
          footer: string | null
          hosted_invoice_url: string | null
          id: string
          invoice_pdf: string | null
          last_finalization_error: Json | null
          lines: Json | null
          livemode: boolean | null
          metadata: Json | null
          next_payment_attempt: number | null
          number: string | null
          object: string | null
          on_behalf_of: string | null
          paid: boolean | null
          payment_intent: string | null
          payment_settings: Json | null
          period_end: number | null
          period_start: number | null
          post_payment_credit_notes_amount: number | null
          pre_payment_credit_notes_amount: number | null
          receipt_number: string | null
          starting_balance: number | null
          statement_descriptor: string | null
          status: Database["stripe"]["Enums"]["invoice_status"] | null
          status_transitions: Json | null
          subscription: string | null
          subtotal: number | null
          tax: number | null
          total: number | null
          total_discount_amounts: Json | null
          total_tax_amounts: Json | null
          transfer_data: Json | null
          updated_at: string
          webhooks_delivered_at: number | null
        }
        Insert: {
          account_country?: string | null
          account_name?: string | null
          account_tax_ids?: Json | null
          amount_due?: number | null
          amount_paid?: number | null
          amount_remaining?: number | null
          application_fee_amount?: number | null
          attempt_count?: number | null
          attempted?: boolean | null
          auto_advance?: boolean | null
          billing_reason?: string | null
          charge?: string | null
          collection_method?: string | null
          created?: number | null
          currency?: string | null
          custom_fields?: Json | null
          customer?: string | null
          customer_address?: Json | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_shipping?: Json | null
          customer_tax_exempt?: string | null
          customer_tax_ids?: Json | null
          default_payment_method?: string | null
          default_source?: string | null
          default_tax_rates?: Json | null
          description?: string | null
          discount?: Json | null
          discounts?: Json | null
          due_date?: number | null
          ending_balance?: number | null
          footer?: string | null
          hosted_invoice_url?: string | null
          id: string
          invoice_pdf?: string | null
          last_finalization_error?: Json | null
          lines?: Json | null
          livemode?: boolean | null
          metadata?: Json | null
          next_payment_attempt?: number | null
          number?: string | null
          object?: string | null
          on_behalf_of?: string | null
          paid?: boolean | null
          payment_intent?: string | null
          payment_settings?: Json | null
          period_end?: number | null
          period_start?: number | null
          post_payment_credit_notes_amount?: number | null
          pre_payment_credit_notes_amount?: number | null
          receipt_number?: string | null
          starting_balance?: number | null
          statement_descriptor?: string | null
          status?: Database["stripe"]["Enums"]["invoice_status"] | null
          status_transitions?: Json | null
          subscription?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          total_discount_amounts?: Json | null
          total_tax_amounts?: Json | null
          transfer_data?: Json | null
          updated_at?: string
          webhooks_delivered_at?: number | null
        }
        Update: {
          account_country?: string | null
          account_name?: string | null
          account_tax_ids?: Json | null
          amount_due?: number | null
          amount_paid?: number | null
          amount_remaining?: number | null
          application_fee_amount?: number | null
          attempt_count?: number | null
          attempted?: boolean | null
          auto_advance?: boolean | null
          billing_reason?: string | null
          charge?: string | null
          collection_method?: string | null
          created?: number | null
          currency?: string | null
          custom_fields?: Json | null
          customer?: string | null
          customer_address?: Json | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_shipping?: Json | null
          customer_tax_exempt?: string | null
          customer_tax_ids?: Json | null
          default_payment_method?: string | null
          default_source?: string | null
          default_tax_rates?: Json | null
          description?: string | null
          discount?: Json | null
          discounts?: Json | null
          due_date?: number | null
          ending_balance?: number | null
          footer?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf?: string | null
          last_finalization_error?: Json | null
          lines?: Json | null
          livemode?: boolean | null
          metadata?: Json | null
          next_payment_attempt?: number | null
          number?: string | null
          object?: string | null
          on_behalf_of?: string | null
          paid?: boolean | null
          payment_intent?: string | null
          payment_settings?: Json | null
          period_end?: number | null
          period_start?: number | null
          post_payment_credit_notes_amount?: number | null
          pre_payment_credit_notes_amount?: number | null
          receipt_number?: string | null
          starting_balance?: number | null
          statement_descriptor?: string | null
          status?: Database["stripe"]["Enums"]["invoice_status"] | null
          status_transitions?: Json | null
          subscription?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          total_discount_amounts?: Json | null
          total_tax_amounts?: Json | null
          transfer_data?: Json | null
          updated_at?: string
          webhooks_delivered_at?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_fkey"
            columns: ["customer"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_fkey"
            columns: ["subscription"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount: number | null
          amount_capturable: number | null
          amount_details: Json | null
          amount_received: number | null
          application: string | null
          application_fee_amount: number | null
          automatic_payment_methods: string | null
          canceled_at: number | null
          cancellation_reason: string | null
          capture_method: string | null
          client_secret: string | null
          confirmation_method: string | null
          created: number | null
          currency: string | null
          customer: string | null
          description: string | null
          id: string
          invoice: string | null
          last_payment_error: string | null
          livemode: boolean | null
          metadata: Json | null
          next_action: string | null
          object: string | null
          on_behalf_of: string | null
          payment_method: string | null
          payment_method_options: Json | null
          payment_method_types: Json | null
          processing: string | null
          receipt_email: string | null
          review: string | null
          setup_future_usage: string | null
          shipping: Json | null
          statement_descriptor: string | null
          statement_descriptor_suffix: string | null
          status: string | null
          transfer_data: Json | null
          transfer_group: string | null
        }
        Insert: {
          amount?: number | null
          amount_capturable?: number | null
          amount_details?: Json | null
          amount_received?: number | null
          application?: string | null
          application_fee_amount?: number | null
          automatic_payment_methods?: string | null
          canceled_at?: number | null
          cancellation_reason?: string | null
          capture_method?: string | null
          client_secret?: string | null
          confirmation_method?: string | null
          created?: number | null
          currency?: string | null
          customer?: string | null
          description?: string | null
          id: string
          invoice?: string | null
          last_payment_error?: string | null
          livemode?: boolean | null
          metadata?: Json | null
          next_action?: string | null
          object?: string | null
          on_behalf_of?: string | null
          payment_method?: string | null
          payment_method_options?: Json | null
          payment_method_types?: Json | null
          processing?: string | null
          receipt_email?: string | null
          review?: string | null
          setup_future_usage?: string | null
          shipping?: Json | null
          statement_descriptor?: string | null
          statement_descriptor_suffix?: string | null
          status?: string | null
          transfer_data?: Json | null
          transfer_group?: string | null
        }
        Update: {
          amount?: number | null
          amount_capturable?: number | null
          amount_details?: Json | null
          amount_received?: number | null
          application?: string | null
          application_fee_amount?: number | null
          automatic_payment_methods?: string | null
          canceled_at?: number | null
          cancellation_reason?: string | null
          capture_method?: string | null
          client_secret?: string | null
          confirmation_method?: string | null
          created?: number | null
          currency?: string | null
          customer?: string | null
          description?: string | null
          id?: string
          invoice?: string | null
          last_payment_error?: string | null
          livemode?: boolean | null
          metadata?: Json | null
          next_action?: string | null
          object?: string | null
          on_behalf_of?: string | null
          payment_method?: string | null
          payment_method_options?: Json | null
          payment_method_types?: Json | null
          processing?: string | null
          receipt_email?: string | null
          review?: string | null
          setup_future_usage?: string | null
          shipping?: Json | null
          statement_descriptor?: string | null
          statement_descriptor_suffix?: string | null
          status?: string | null
          transfer_data?: Json | null
          transfer_group?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          billing_details: Json | null
          card: Json | null
          created: number | null
          customer: string | null
          id: string
          metadata: Json | null
          object: string | null
          type: string | null
        }
        Insert: {
          billing_details?: Json | null
          card?: Json | null
          created?: number | null
          customer?: string | null
          id: string
          metadata?: Json | null
          object?: string | null
          type?: string | null
        }
        Update: {
          billing_details?: Json | null
          card?: Json | null
          created?: number | null
          customer?: string | null
          id?: string
          metadata?: Json | null
          object?: string | null
          type?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number | null
          amount_reversed: number | null
          arrival_date: string | null
          automatic: boolean | null
          balance_transaction: string | null
          bank_account: Json | null
          created: number | null
          currency: string | null
          date: string | null
          description: string | null
          destination: string | null
          failure_balance_transaction: string | null
          failure_code: string | null
          failure_message: string | null
          id: string
          livemode: boolean | null
          metadata: Json | null
          method: string | null
          object: string | null
          recipient: string | null
          source_transaction: string | null
          source_type: string | null
          statement_description: string | null
          statement_descriptor: string | null
          status: string | null
          transfer_group: string | null
          type: string | null
          updated: number | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          amount_reversed?: number | null
          arrival_date?: string | null
          automatic?: boolean | null
          balance_transaction?: string | null
          bank_account?: Json | null
          created?: number | null
          currency?: string | null
          date?: string | null
          description?: string | null
          destination?: string | null
          failure_balance_transaction?: string | null
          failure_code?: string | null
          failure_message?: string | null
          id: string
          livemode?: boolean | null
          metadata?: Json | null
          method?: string | null
          object?: string | null
          recipient?: string | null
          source_transaction?: string | null
          source_type?: string | null
          statement_description?: string | null
          statement_descriptor?: string | null
          status?: string | null
          transfer_group?: string | null
          type?: string | null
          updated?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          amount_reversed?: number | null
          arrival_date?: string | null
          automatic?: boolean | null
          balance_transaction?: string | null
          bank_account?: Json | null
          created?: number | null
          currency?: string | null
          date?: string | null
          description?: string | null
          destination?: string | null
          failure_balance_transaction?: string | null
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          livemode?: boolean | null
          metadata?: Json | null
          method?: string | null
          object?: string | null
          recipient?: string | null
          source_transaction?: string | null
          source_type?: string | null
          statement_description?: string | null
          statement_descriptor?: string | null
          status?: string | null
          transfer_group?: string | null
          type?: string | null
          updated?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean | null
          aggregate_usage: string | null
          amount: number | null
          billing_scheme: string | null
          created: number | null
          currency: string | null
          id: string
          interval: string | null
          interval_count: number | null
          livemode: boolean | null
          metadata: Json | null
          nickname: string | null
          object: string | null
          product: string | null
          tiers_mode: string | null
          transform_usage: string | null
          trial_period_days: number | null
          updated_at: string
          usage_type: string | null
        }
        Insert: {
          active?: boolean | null
          aggregate_usage?: string | null
          amount?: number | null
          billing_scheme?: string | null
          created?: number | null
          currency?: string | null
          id: string
          interval?: string | null
          interval_count?: number | null
          livemode?: boolean | null
          metadata?: Json | null
          nickname?: string | null
          object?: string | null
          product?: string | null
          tiers_mode?: string | null
          transform_usage?: string | null
          trial_period_days?: number | null
          updated_at?: string
          usage_type?: string | null
        }
        Update: {
          active?: boolean | null
          aggregate_usage?: string | null
          amount?: number | null
          billing_scheme?: string | null
          created?: number | null
          currency?: string | null
          id?: string
          interval?: string | null
          interval_count?: number | null
          livemode?: boolean | null
          metadata?: Json | null
          nickname?: string | null
          object?: string | null
          product?: string | null
          tiers_mode?: string | null
          transform_usage?: string | null
          trial_period_days?: number | null
          updated_at?: string
          usage_type?: string | null
        }
        Relationships: []
      }
      prices: {
        Row: {
          active: boolean | null
          billing_scheme: string | null
          created: number | null
          currency: string | null
          id: string
          livemode: boolean | null
          lookup_key: string | null
          metadata: Json | null
          nickname: string | null
          object: string | null
          product: string | null
          recurring: Json | null
          tiers_mode: Database["stripe"]["Enums"]["pricing_tiers"] | null
          transform_quantity: Json | null
          type: Database["stripe"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
          unit_amount_decimal: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          billing_scheme?: string | null
          created?: number | null
          currency?: string | null
          id: string
          livemode?: boolean | null
          lookup_key?: string | null
          metadata?: Json | null
          nickname?: string | null
          object?: string | null
          product?: string | null
          recurring?: Json | null
          tiers_mode?: Database["stripe"]["Enums"]["pricing_tiers"] | null
          transform_quantity?: Json | null
          type?: Database["stripe"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
          unit_amount_decimal?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          billing_scheme?: string | null
          created?: number | null
          currency?: string | null
          id?: string
          livemode?: boolean | null
          lookup_key?: string | null
          metadata?: Json | null
          nickname?: string | null
          object?: string | null
          product?: string | null
          recurring?: Json | null
          tiers_mode?: Database["stripe"]["Enums"]["pricing_tiers"] | null
          transform_quantity?: Json | null
          type?: Database["stripe"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
          unit_amount_decimal?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_fkey"
            columns: ["product"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          created: number | null
          default_price: string | null
          description: string | null
          id: string
          images: Json | null
          livemode: boolean | null
          marketing_features: Json | null
          metadata: Json | null
          name: string | null
          object: string | null
          package_dimensions: Json | null
          shippable: boolean | null
          statement_descriptor: string | null
          unit_label: string | null
          updated: number | null
          updated_at: string
          url: string | null
        }
        Insert: {
          active?: boolean | null
          created?: number | null
          default_price?: string | null
          description?: string | null
          id: string
          images?: Json | null
          livemode?: boolean | null
          marketing_features?: Json | null
          metadata?: Json | null
          name?: string | null
          object?: string | null
          package_dimensions?: Json | null
          shippable?: boolean | null
          statement_descriptor?: string | null
          unit_label?: string | null
          updated?: number | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          active?: boolean | null
          created?: number | null
          default_price?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          livemode?: boolean | null
          marketing_features?: Json | null
          metadata?: Json | null
          name?: string | null
          object?: string | null
          package_dimensions?: Json | null
          shippable?: boolean | null
          statement_descriptor?: string | null
          unit_label?: string | null
          updated?: number | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number | null
          balance_transaction: string | null
          charge: string | null
          created: number | null
          currency: string | null
          destination_details: Json | null
          id: string
          metadata: Json | null
          object: string | null
          payment_intent: string | null
          reason: string | null
          receipt_number: string | null
          source_transfer_reversal: string | null
          status: string | null
          transfer_reversal: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          balance_transaction?: string | null
          charge?: string | null
          created?: number | null
          currency?: string | null
          destination_details?: Json | null
          id: string
          metadata?: Json | null
          object?: string | null
          payment_intent?: string | null
          reason?: string | null
          receipt_number?: string | null
          source_transfer_reversal?: string | null
          status?: string | null
          transfer_reversal?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          balance_transaction?: string | null
          charge?: string | null
          created?: number | null
          currency?: string | null
          destination_details?: Json | null
          id?: string
          metadata?: Json | null
          object?: string | null
          payment_intent?: string | null
          reason?: string | null
          receipt_number?: string | null
          source_transfer_reversal?: string | null
          status?: string | null
          transfer_reversal?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          billing_zip: string | null
          charge: string | null
          closed_reason: string | null
          created: number | null
          id: string
          ip_address: string | null
          ip_address_location: Json | null
          livemode: boolean | null
          object: string | null
          open: boolean | null
          opened_reason: string | null
          payment_intent: string | null
          reason: string | null
          session: string | null
          updated_at: string
        }
        Insert: {
          billing_zip?: string | null
          charge?: string | null
          closed_reason?: string | null
          created?: number | null
          id: string
          ip_address?: string | null
          ip_address_location?: Json | null
          livemode?: boolean | null
          object?: string | null
          open?: boolean | null
          opened_reason?: string | null
          payment_intent?: string | null
          reason?: string | null
          session?: string | null
          updated_at?: string
        }
        Update: {
          billing_zip?: string | null
          charge?: string | null
          closed_reason?: string | null
          created?: number | null
          id?: string
          ip_address?: string | null
          ip_address_location?: Json | null
          livemode?: boolean | null
          object?: string | null
          open?: boolean | null
          opened_reason?: string | null
          payment_intent?: string | null
          reason?: string | null
          session?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      setup_intents: {
        Row: {
          cancellation_reason: string | null
          created: number | null
          customer: string | null
          description: string | null
          id: string
          latest_attempt: string | null
          mandate: string | null
          object: string | null
          on_behalf_of: string | null
          payment_method: string | null
          single_use_mandate: string | null
          status: string | null
          usage: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          created?: number | null
          customer?: string | null
          description?: string | null
          id: string
          latest_attempt?: string | null
          mandate?: string | null
          object?: string | null
          on_behalf_of?: string | null
          payment_method?: string | null
          single_use_mandate?: string | null
          status?: string | null
          usage?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          created?: number | null
          customer?: string | null
          description?: string | null
          id?: string
          latest_attempt?: string | null
          mandate?: string | null
          object?: string | null
          on_behalf_of?: string | null
          payment_method?: string | null
          single_use_mandate?: string | null
          status?: string | null
          usage?: string | null
        }
        Relationships: []
      }
      subscription_items: {
        Row: {
          billing_thresholds: Json | null
          created: number | null
          current_period_end: number | null
          current_period_start: number | null
          deleted: boolean | null
          id: string
          metadata: Json | null
          object: string | null
          price: string | null
          quantity: number | null
          subscription: string | null
          tax_rates: Json | null
        }
        Insert: {
          billing_thresholds?: Json | null
          created?: number | null
          current_period_end?: number | null
          current_period_start?: number | null
          deleted?: boolean | null
          id: string
          metadata?: Json | null
          object?: string | null
          price?: string | null
          quantity?: number | null
          subscription?: string | null
          tax_rates?: Json | null
        }
        Update: {
          billing_thresholds?: Json | null
          created?: number | null
          current_period_end?: number | null
          current_period_start?: number | null
          deleted?: boolean | null
          id?: string
          metadata?: Json | null
          object?: string | null
          price?: string | null
          quantity?: number | null
          subscription?: string | null
          tax_rates?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_items_subscription_fkey"
            columns: ["subscription"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_schedules: {
        Row: {
          application: string | null
          canceled_at: number | null
          completed_at: number | null
          created: number
          current_phase: Json | null
          customer: string
          default_settings: Json | null
          end_behavior: string | null
          id: string
          livemode: boolean
          metadata: Json
          object: string | null
          phases: Json
          released_at: number | null
          released_subscription: string | null
          status: Database["stripe"]["Enums"]["subscription_schedule_status"]
          subscription: string | null
          test_clock: string | null
        }
        Insert: {
          application?: string | null
          canceled_at?: number | null
          completed_at?: number | null
          created: number
          current_phase?: Json | null
          customer: string
          default_settings?: Json | null
          end_behavior?: string | null
          id: string
          livemode: boolean
          metadata: Json
          object?: string | null
          phases: Json
          released_at?: number | null
          released_subscription?: string | null
          status: Database["stripe"]["Enums"]["subscription_schedule_status"]
          subscription?: string | null
          test_clock?: string | null
        }
        Update: {
          application?: string | null
          canceled_at?: number | null
          completed_at?: number | null
          created?: number
          current_phase?: Json | null
          customer?: string
          default_settings?: Json | null
          end_behavior?: string | null
          id?: string
          livemode?: boolean
          metadata?: Json
          object?: string | null
          phases?: Json
          released_at?: number | null
          released_subscription?: string | null
          status?: Database["stripe"]["Enums"]["subscription_schedule_status"]
          subscription?: string | null
          test_clock?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          application_fee_percent: number | null
          billing_cycle_anchor: number | null
          billing_thresholds: Json | null
          cancel_at: number | null
          cancel_at_period_end: boolean | null
          canceled_at: number | null
          collection_method: string | null
          created: number | null
          current_period_end: number | null
          current_period_start: number | null
          customer: string | null
          days_until_due: number | null
          default_payment_method: string | null
          default_source: string | null
          default_tax_rates: Json | null
          discount: Json | null
          ended_at: number | null
          id: string
          items: Json | null
          latest_invoice: string | null
          livemode: boolean | null
          metadata: Json | null
          next_pending_invoice_item_invoice: number | null
          object: string | null
          pause_collection: Json | null
          pending_invoice_item_interval: Json | null
          pending_setup_intent: string | null
          pending_update: Json | null
          plan: string | null
          schedule: string | null
          start_date: number | null
          status: Database["stripe"]["Enums"]["subscription_status"] | null
          transfer_data: Json | null
          trial_end: Json | null
          trial_start: Json | null
          updated_at: string
        }
        Insert: {
          application_fee_percent?: number | null
          billing_cycle_anchor?: number | null
          billing_thresholds?: Json | null
          cancel_at?: number | null
          cancel_at_period_end?: boolean | null
          canceled_at?: number | null
          collection_method?: string | null
          created?: number | null
          current_period_end?: number | null
          current_period_start?: number | null
          customer?: string | null
          days_until_due?: number | null
          default_payment_method?: string | null
          default_source?: string | null
          default_tax_rates?: Json | null
          discount?: Json | null
          ended_at?: number | null
          id: string
          items?: Json | null
          latest_invoice?: string | null
          livemode?: boolean | null
          metadata?: Json | null
          next_pending_invoice_item_invoice?: number | null
          object?: string | null
          pause_collection?: Json | null
          pending_invoice_item_interval?: Json | null
          pending_setup_intent?: string | null
          pending_update?: Json | null
          plan?: string | null
          schedule?: string | null
          start_date?: number | null
          status?: Database["stripe"]["Enums"]["subscription_status"] | null
          transfer_data?: Json | null
          trial_end?: Json | null
          trial_start?: Json | null
          updated_at?: string
        }
        Update: {
          application_fee_percent?: number | null
          billing_cycle_anchor?: number | null
          billing_thresholds?: Json | null
          cancel_at?: number | null
          cancel_at_period_end?: boolean | null
          canceled_at?: number | null
          collection_method?: string | null
          created?: number | null
          current_period_end?: number | null
          current_period_start?: number | null
          customer?: string | null
          days_until_due?: number | null
          default_payment_method?: string | null
          default_source?: string | null
          default_tax_rates?: Json | null
          discount?: Json | null
          ended_at?: number | null
          id?: string
          items?: Json | null
          latest_invoice?: string | null
          livemode?: boolean | null
          metadata?: Json | null
          next_pending_invoice_item_invoice?: number | null
          object?: string | null
          pause_collection?: Json | null
          pending_invoice_item_interval?: Json | null
          pending_setup_intent?: string | null
          pending_update?: Json | null
          plan?: string | null
          schedule?: string | null
          start_date?: number | null
          status?: Database["stripe"]["Enums"]["subscription_status"] | null
          transfer_data?: Json | null
          trial_end?: Json | null
          trial_start?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_fkey"
            columns: ["customer"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_ids: {
        Row: {
          country: string | null
          created: number
          customer: string | null
          id: string
          livemode: boolean | null
          object: string | null
          owner: Json | null
          type: string | null
          value: string | null
        }
        Insert: {
          country?: string | null
          created: number
          customer?: string | null
          id: string
          livemode?: boolean | null
          object?: string | null
          owner?: Json | null
          type?: string | null
          value?: string | null
        }
        Update: {
          country?: string | null
          created?: number
          customer?: string | null
          id?: string
          livemode?: boolean | null
          object?: string | null
          owner?: Json | null
          type?: string | null
          value?: string | null
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
      invoice_status:
        | "draft"
        | "open"
        | "paid"
        | "uncollectible"
        | "void"
        | "deleted"
      pricing_tiers: "graduated" | "volume"
      pricing_type: "one_time" | "recurring"
      subscription_schedule_status:
        | "not_started"
        | "active"
        | "completed"
        | "released"
        | "canceled"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      audit_action_enum: ["INSERT", "UPDATE", "DELETE"],
      call_type_enum: ["onboarding", "check_in", "monthly", "other"],
      client_overall_status: [
        "new",
        "live",
        "paused",
        "churned",
        "ready_for_coach_assignment",
        "offboarding",
      ],
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
      testimonial_type_enum: ["written", "email", "video"],
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
  stripe: {
    Enums: {
      invoice_status: [
        "draft",
        "open",
        "paid",
        "uncollectible",
        "void",
        "deleted",
      ],
      pricing_tiers: ["graduated", "volume"],
      pricing_type: ["one_time", "recurring"],
      subscription_schedule_status: [
        "not_started",
        "active",
        "completed",
        "released",
        "canceled",
      ],
      subscription_status: [
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
      ],
    },
  },
} as const
