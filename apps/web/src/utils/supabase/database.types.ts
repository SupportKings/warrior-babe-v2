export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instanciate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "12.2.3 (519615d)";
	};
	graphql_public: {
		Tables: {
			[_ in never]: never;
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			graphql: {
				Args: {
					operationName?: string;
					query?: string;
					variables?: Json;
					extensions?: Json;
				};
				Returns: Json;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	public: {
		Tables: {
			account: {
				Row: {
					accessToken: string | null;
					accessTokenExpiresAt: string | null;
					accountId: string;
					createdAt: string;
					id: string;
					idToken: string | null;
					password: string | null;
					providerId: string;
					refreshToken: string | null;
					refreshTokenExpiresAt: string | null;
					scope: string | null;
					updatedAt: string;
					userId: string;
				};
				Insert: {
					accessToken?: string | null;
					accessTokenExpiresAt?: string | null;
					accountId: string;
					createdAt: string;
					id: string;
					idToken?: string | null;
					password?: string | null;
					providerId: string;
					refreshToken?: string | null;
					refreshTokenExpiresAt?: string | null;
					scope?: string | null;
					updatedAt: string;
					userId: string;
				};
				Update: {
					accessToken?: string | null;
					accessTokenExpiresAt?: string | null;
					accountId?: string;
					createdAt?: string;
					id?: string;
					idToken?: string | null;
					password?: string | null;
					providerId?: string;
					refreshToken?: string | null;
					refreshTokenExpiresAt?: string | null;
					scope?: string | null;
					updatedAt?: string;
					userId?: string;
				};
				Relationships: [
					{
						foreignKeyName: "account_userId_fkey";
						columns: ["userId"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			audit_log: {
				Row: {
					action: Database["public"]["Enums"]["audit_action_enum"];
					change_type: string | null;
					changed_at: string | null;
					changed_by: string | null;
					client_id: string | null;
					id: string;
					new_values: Json | null;
					old_values: Json | null;
					record_id: string;
					table_name: string;
				};
				Insert: {
					action: Database["public"]["Enums"]["audit_action_enum"];
					change_type?: string | null;
					changed_at?: string | null;
					changed_by?: string | null;
					client_id?: string | null;
					id?: string;
					new_values?: Json | null;
					old_values?: Json | null;
					record_id: string;
					table_name: string;
				};
				Update: {
					action?: Database["public"]["Enums"]["audit_action_enum"];
					change_type?: string | null;
					changed_at?: string | null;
					changed_by?: string | null;
					client_id?: string | null;
					id?: string;
					new_values?: Json | null;
					old_values?: Json | null;
					record_id?: string;
					table_name?: string;
				};
				Relationships: [
					{
						foreignKeyName: "audit_log_changed_by_fkey";
						columns: ["changed_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "audit_log_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
				];
			};
			call_feedback: {
				Row: {
					call_date: string;
					call_type: Database["public"]["Enums"]["call_type_enum"];
					client_id: string;
					feedback_text: string | null;
					id: string;
					rating: number | null;
					submitted_at: string | null;
				};
				Insert: {
					call_date: string;
					call_type: Database["public"]["Enums"]["call_type_enum"];
					client_id: string;
					feedback_text?: string | null;
					id?: string;
					rating?: number | null;
					submitted_at?: string | null;
				};
				Update: {
					call_date?: string;
					call_type?: Database["public"]["Enums"]["call_type_enum"];
					client_id?: string;
					feedback_text?: string | null;
					id?: string;
					rating?: number | null;
					submitted_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "call_feedback_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
				];
			};
			certifications: {
				Row: {
					created_at: string | null;
					description: string | null;
					icon: string | null;
					id: string;
					is_active: boolean | null;
					issuer: string;
					name: string;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					description?: string | null;
					icon?: string | null;
					id?: string;
					is_active?: boolean | null;
					issuer: string;
					name: string;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					description?: string | null;
					icon?: string | null;
					id?: string;
					is_active?: boolean | null;
					issuer?: string;
					name?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			checklist_items: {
				Row: {
					created_at: string | null;
					description: string | null;
					id: string;
					is_required: boolean | null;
					sort_order: number;
					template_id: string;
					title: string;
				};
				Insert: {
					created_at?: string | null;
					description?: string | null;
					id?: string;
					is_required?: boolean | null;
					sort_order: number;
					template_id: string;
					title: string;
				};
				Update: {
					created_at?: string | null;
					description?: string | null;
					id?: string;
					is_required?: boolean | null;
					sort_order?: number;
					template_id?: string;
					title?: string;
				};
				Relationships: [
					{
						foreignKeyName: "checklist_items_template_id_fkey";
						columns: ["template_id"];
						isOneToOne: false;
						referencedRelation: "checklist_templates";
						referencedColumns: ["id"];
					},
				];
			};
			checklist_templates: {
				Row: {
					created_at: string | null;
					id: string;
					is_active: boolean | null;
					name: string;
					type: string;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					is_active?: boolean | null;
					name: string;
					type: string;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					is_active?: boolean | null;
					name?: string;
					type?: string;
				};
				Relationships: [];
			};
			client_activity: {
				Row: {
					activity_date: string;
					checkin_completed: boolean | null;
					client_id: string;
					created_at: string | null;
					id: string;
					is_active: boolean;
					meals_tracked: number | null;
					messages_sent: number | null;
					one_on_one_call_attended: boolean | null;
					team_call_attended: boolean | null;
					workouts_logged: number | null;
				};
				Insert: {
					activity_date: string;
					checkin_completed?: boolean | null;
					client_id: string;
					created_at?: string | null;
					id?: string;
					is_active: boolean;
					meals_tracked?: number | null;
					messages_sent?: number | null;
					one_on_one_call_attended?: boolean | null;
					team_call_attended?: boolean | null;
					workouts_logged?: number | null;
				};
				Update: {
					activity_date?: string;
					checkin_completed?: boolean | null;
					client_id?: string;
					created_at?: string | null;
					id?: string;
					is_active?: boolean;
					meals_tracked?: number | null;
					messages_sent?: number | null;
					one_on_one_call_attended?: boolean | null;
					team_call_attended?: boolean | null;
					workouts_logged?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: "client_activity_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
				];
			};
			client_assignments: {
				Row: {
					assigned_by: string | null;
					assignment_type: string;
					client_id: string;
					created_at: string | null;
					end_date: string | null;
					id: string;
					start_date: string;
					user_id: string;
				};
				Insert: {
					assigned_by?: string | null;
					assignment_type: string;
					client_id: string;
					created_at?: string | null;
					end_date?: string | null;
					id?: string;
					start_date: string;
					user_id: string;
				};
				Update: {
					assigned_by?: string | null;
					assignment_type?: string;
					client_id?: string;
					created_at?: string | null;
					end_date?: string | null;
					id?: string;
					start_date?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "client_assignments_assigned_by_fkey";
						columns: ["assigned_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_assignments_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_assignments_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			client_goals: {
				Row: {
					assigned_by: string | null;
					client_id: string;
					completed_at: string | null;
					created_at: string | null;
					created_by: string | null;
					current_value: number | null;
					description: string | null;
					due_date: string | null;
					goal_type_id: string | null;
					id: string;
					notes: string | null;
					priority: string | null;
					started_at: string | null;
					status: string | null;
					target_value: number | null;
					title: string;
					updated_at: string | null;
				};
				Insert: {
					assigned_by?: string | null;
					client_id: string;
					completed_at?: string | null;
					created_at?: string | null;
					created_by?: string | null;
					current_value?: number | null;
					description?: string | null;
					due_date?: string | null;
					goal_type_id?: string | null;
					id?: string;
					notes?: string | null;
					priority?: string | null;
					started_at?: string | null;
					status?: string | null;
					target_value?: number | null;
					title: string;
					updated_at?: string | null;
				};
				Update: {
					assigned_by?: string | null;
					client_id?: string;
					completed_at?: string | null;
					created_at?: string | null;
					created_by?: string | null;
					current_value?: number | null;
					description?: string | null;
					due_date?: string | null;
					goal_type_id?: string | null;
					id?: string;
					notes?: string | null;
					priority?: string | null;
					started_at?: string | null;
					status?: string | null;
					target_value?: number | null;
					title?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "client_goals_assigned_by_fkey";
						columns: ["assigned_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_goals_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_goals_created_by_fkey";
						columns: ["created_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_goals_goal_type_id_fkey";
						columns: ["goal_type_id"];
						isOneToOne: false;
						referencedRelation: "goal_types";
						referencedColumns: ["id"];
					},
				];
			};
			client_nps: {
				Row: {
					client_assignment_id: string | null;
					client_id: string;
					created_at: string | null;
					id: string;
					notes: string | null;
					nps_score: number;
					recorded_by: string | null;
					recorded_date: string;
				};
				Insert: {
					client_assignment_id?: string | null;
					client_id: string;
					created_at?: string | null;
					id?: string;
					notes?: string | null;
					nps_score: number;
					recorded_by?: string | null;
					recorded_date: string;
				};
				Update: {
					client_assignment_id?: string | null;
					client_id?: string;
					created_at?: string | null;
					id?: string;
					notes?: string | null;
					nps_score?: number;
					recorded_by?: string | null;
					recorded_date?: string;
				};
				Relationships: [
					{
						foreignKeyName: "client_nps_client_assignment_id_fkey";
						columns: ["client_assignment_id"];
						isOneToOne: false;
						referencedRelation: "client_assignments";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_nps_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_nps_recorded_by_fkey";
						columns: ["recorded_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			client_onboarding_progress: {
				Row: {
					checklist_item_id: string;
					client_id: string;
					completed_at: string | null;
					completed_by: string | null;
					created_at: string | null;
					id: string;
					is_completed: boolean | null;
					notes: string | null;
				};
				Insert: {
					checklist_item_id: string;
					client_id: string;
					completed_at?: string | null;
					completed_by?: string | null;
					created_at?: string | null;
					id?: string;
					is_completed?: boolean | null;
					notes?: string | null;
				};
				Update: {
					checklist_item_id?: string;
					client_id?: string;
					completed_at?: string | null;
					completed_by?: string | null;
					created_at?: string | null;
					id?: string;
					is_completed?: boolean | null;
					notes?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "client_onboarding_progress_checklist_item_id_fkey";
						columns: ["checklist_item_id"];
						isOneToOne: false;
						referencedRelation: "checklist_items";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_onboarding_progress_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_onboarding_progress_completed_by_fkey";
						columns: ["completed_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			client_testimonials: {
				Row: {
					allow_public_sharing: boolean | null;
					client_id: string;
					content: string | null;
					created_at: string | null;
					id: string;
					recorded_by: string | null;
					recorded_date: string;
					testimonial_type: Database["public"]["Enums"]["testimonial_type_enum"];
					testimonial_url: string | null;
				};
				Insert: {
					allow_public_sharing?: boolean | null;
					client_id: string;
					content?: string | null;
					created_at?: string | null;
					id?: string;
					recorded_by?: string | null;
					recorded_date: string;
					testimonial_type: Database["public"]["Enums"]["testimonial_type_enum"];
					testimonial_url?: string | null;
				};
				Update: {
					allow_public_sharing?: boolean | null;
					client_id?: string;
					content?: string | null;
					created_at?: string | null;
					id?: string;
					recorded_by?: string | null;
					recorded_date?: string;
					testimonial_type?: Database["public"]["Enums"]["testimonial_type_enum"];
					testimonial_url?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "client_testimonials_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_testimonials_recorded_by_fkey";
						columns: ["recorded_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			client_units: {
				Row: {
					base_units: number;
					calculated_units: number;
					calculation_date: string;
					client_id: string;
					coach_id: string;
					created_at: string | null;
					escalations_factor: number | null;
					id: string;
					messages_factor: number | null;
					nps_factor: number | null;
					subjective_difficulty: number | null;
					time_since_start_factor: number | null;
					wins_factor: number | null;
				};
				Insert: {
					base_units?: number;
					calculated_units: number;
					calculation_date: string;
					client_id: string;
					coach_id: string;
					created_at?: string | null;
					escalations_factor?: number | null;
					id?: string;
					messages_factor?: number | null;
					nps_factor?: number | null;
					subjective_difficulty?: number | null;
					time_since_start_factor?: number | null;
					wins_factor?: number | null;
				};
				Update: {
					base_units?: number;
					calculated_units?: number;
					calculation_date?: string;
					client_id?: string;
					coach_id?: string;
					created_at?: string | null;
					escalations_factor?: number | null;
					id?: string;
					messages_factor?: number | null;
					nps_factor?: number | null;
					subjective_difficulty?: number | null;
					time_since_start_factor?: number | null;
					wins_factor?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: "client_units_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_units_coach_id_fkey";
						columns: ["coach_id"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			client_win_tags: {
				Row: {
					id: string;
					tag_id: string;
					win_id: string;
				};
				Insert: {
					id?: string;
					tag_id: string;
					win_id: string;
				};
				Update: {
					id?: string;
					tag_id?: string;
					win_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "client_win_tags_tag_id_fkey";
						columns: ["tag_id"];
						isOneToOne: false;
						referencedRelation: "win_tags";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_win_tags_win_id_fkey";
						columns: ["win_id"];
						isOneToOne: false;
						referencedRelation: "client_wins";
						referencedColumns: ["id"];
					},
				];
			};
			client_wins: {
				Row: {
					client_id: string;
					created_at: string | null;
					description: string | null;
					id: string;
					recorded_by: string | null;
					title: string;
					win_date: string;
				};
				Insert: {
					client_id: string;
					created_at?: string | null;
					description?: string | null;
					id?: string;
					recorded_by?: string | null;
					title: string;
					win_date: string;
				};
				Update: {
					client_id?: string;
					created_at?: string | null;
					description?: string | null;
					id?: string;
					recorded_by?: string | null;
					title?: string;
					win_date?: string;
				};
				Relationships: [
					{
						foreignKeyName: "client_wins_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "client_wins_recorded_by_fkey";
						columns: ["recorded_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			clients: {
				Row: {
					churned_at: string | null;
					consultation_form_completed: boolean | null;
					created_at: string | null;
					created_by: string | null;
					email: string;
					end_date: string | null;
					first_name: string;
					id: string;
					last_name: string;
					offboard_date: string | null;
					onboarding_notes: string | null;
					paused_at: string | null;
					phone: string | null;
					platform_access_status: string | null;
					platform_link: string | null;
					product_id: string | null;
					renewal_date: string | null;
					start_date: string;
					status: string | null;
					updated_at: string | null;
					vip_terms_signed: boolean | null;
				};
				Insert: {
					churned_at?: string | null;
					consultation_form_completed?: boolean | null;
					created_at?: string | null;
					created_by?: string | null;
					email: string;
					end_date?: string | null;
					first_name: string;
					id?: string;
					last_name: string;
					offboard_date?: string | null;
					onboarding_notes?: string | null;
					paused_at?: string | null;
					phone?: string | null;
					platform_access_status?: string | null;
					platform_link?: string | null;
					product_id?: string | null;
					renewal_date?: string | null;
					start_date: string;
					status?: string | null;
					updated_at?: string | null;
					vip_terms_signed?: boolean | null;
				};
				Update: {
					churned_at?: string | null;
					consultation_form_completed?: boolean | null;
					created_at?: string | null;
					created_by?: string | null;
					email?: string;
					end_date?: string | null;
					first_name?: string;
					id?: string;
					last_name?: string;
					offboard_date?: string | null;
					onboarding_notes?: string | null;
					paused_at?: string | null;
					phone?: string | null;
					platform_access_status?: string | null;
					platform_link?: string | null;
					product_id?: string | null;
					renewal_date?: string | null;
					start_date?: string;
					status?: string | null;
					updated_at?: string | null;
					vip_terms_signed?: boolean | null;
				};
				Relationships: [
					{
						foreignKeyName: "clients_created_by_fkey";
						columns: ["created_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "clients_product_id_fkey";
						columns: ["product_id"];
						isOneToOne: false;
						referencedRelation: "products";
						referencedColumns: ["id"];
					},
				];
			};
			coach_capacity: {
				Row: {
					coach_id: string;
					created_at: string | null;
					id: string;
					is_paused: boolean | null;
					max_client_units: number;
					max_new_clients_per_week: number | null;
					paused_at: string | null;
					updated_at: string | null;
				};
				Insert: {
					coach_id: string;
					created_at?: string | null;
					id?: string;
					is_paused?: boolean | null;
					max_client_units: number;
					max_new_clients_per_week?: number | null;
					paused_at?: string | null;
					updated_at?: string | null;
				};
				Update: {
					coach_id?: string;
					created_at?: string | null;
					id?: string;
					is_paused?: boolean | null;
					max_client_units?: number;
					max_new_clients_per_week?: number | null;
					paused_at?: string | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "coach_capacity_coach_id_fkey";
						columns: ["coach_id"];
						isOneToOne: true;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			coach_comments: {
				Row: {
					coach_id: string;
					comment: string;
					created_at: string | null;
					id: string;
					is_internal: boolean | null;
					user_id: string;
				};
				Insert: {
					coach_id: string;
					comment: string;
					created_at?: string | null;
					id?: string;
					is_internal?: boolean | null;
					user_id: string;
				};
				Update: {
					coach_id?: string;
					comment?: string;
					created_at?: string | null;
					id?: string;
					is_internal?: boolean | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "coach_comments_coach_id_fkey";
						columns: ["coach_id"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "coach_comments_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			coach_onboarding: {
				Row: {
					coach_id: string;
					created_at: string | null;
					current_status_start_date: string;
					graduation_date: string | null;
					id: string;
					premier_coach_id: string | null;
					start_date: string;
					status_code: number;
					status_name: string;
					updated_at: string | null;
				};
				Insert: {
					coach_id: string;
					created_at?: string | null;
					current_status_start_date: string;
					graduation_date?: string | null;
					id?: string;
					premier_coach_id?: string | null;
					start_date: string;
					status_code: number;
					status_name: string;
					updated_at?: string | null;
				};
				Update: {
					coach_id?: string;
					created_at?: string | null;
					current_status_start_date?: string;
					graduation_date?: string | null;
					id?: string;
					premier_coach_id?: string | null;
					start_date?: string;
					status_code?: number;
					status_name?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "coach_onboarding_coach_id_fkey";
						columns: ["coach_id"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "coach_onboarding_premier_coach_id_fkey";
						columns: ["premier_coach_id"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			coach_payments: {
				Row: {
					client_id: string;
					coach_id: string;
					cost_per_day: number;
					created_at: string | null;
					days_covered: number;
					id: string;
					is_paid: boolean | null;
					paid_at: string | null;
					payment_date: string;
					total_amount: number;
				};
				Insert: {
					client_id: string;
					coach_id: string;
					cost_per_day: number;
					created_at?: string | null;
					days_covered: number;
					id?: string;
					is_paid?: boolean | null;
					paid_at?: string | null;
					payment_date: string;
					total_amount: number;
				};
				Update: {
					client_id?: string;
					coach_id?: string;
					cost_per_day?: number;
					created_at?: string | null;
					days_covered?: number;
					id?: string;
					is_paid?: boolean | null;
					paid_at?: string | null;
					payment_date?: string;
					total_amount?: number;
				};
				Relationships: [
					{
						foreignKeyName: "coach_payments_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "coach_payments_coach_id_fkey";
						columns: ["coach_id"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			coach_teams: {
				Row: {
					coach_id: string;
					created_at: string | null;
					end_date: string | null;
					id: string;
					premier_coach_id: string;
					start_date: string;
				};
				Insert: {
					coach_id: string;
					created_at?: string | null;
					end_date?: string | null;
					id?: string;
					premier_coach_id: string;
					start_date: string;
				};
				Update: {
					coach_id?: string;
					created_at?: string | null;
					end_date?: string | null;
					id?: string;
					premier_coach_id?: string;
					start_date?: string;
				};
				Relationships: [
					{
						foreignKeyName: "coach_teams_coach_id_fkey";
						columns: ["coach_id"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "coach_teams_premier_coach_id_fkey";
						columns: ["premier_coach_id"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			financial_settings: {
				Row: {
					created_at: string | null;
					created_by: string | null;
					effective_date: string;
					id: string;
					setting_name: string;
					setting_value: number;
				};
				Insert: {
					created_at?: string | null;
					created_by?: string | null;
					effective_date: string;
					id?: string;
					setting_name: string;
					setting_value: number;
				};
				Update: {
					created_at?: string | null;
					created_by?: string | null;
					effective_date?: string;
					id?: string;
					setting_name?: string;
					setting_value?: number;
				};
				Relationships: [
					{
						foreignKeyName: "financial_settings_created_by_fkey";
						columns: ["created_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			goal_categories: {
				Row: {
					created_at: string | null;
					description: string | null;
					id: string;
					is_active: boolean | null;
					name: string;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					description?: string | null;
					id?: string;
					is_active?: boolean | null;
					name: string;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					description?: string | null;
					id?: string;
					is_active?: boolean | null;
					name?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			goal_types: {
				Row: {
					category: string | null;
					category_id: string | null;
					created_at: string | null;
					default_duration_days: number | null;
					description: string | null;
					icon: string | null;
					id: string;
					is_active: boolean | null;
					is_measurable: boolean | null;
					name: string;
					unit_of_measure: string | null;
					updated_at: string | null;
				};
				Insert: {
					category?: string | null;
					category_id?: string | null;
					created_at?: string | null;
					default_duration_days?: number | null;
					description?: string | null;
					icon?: string | null;
					id?: string;
					is_active?: boolean | null;
					is_measurable?: boolean | null;
					name: string;
					unit_of_measure?: string | null;
					updated_at?: string | null;
				};
				Update: {
					category?: string | null;
					category_id?: string | null;
					created_at?: string | null;
					default_duration_days?: number | null;
					description?: string | null;
					icon?: string | null;
					id?: string;
					is_active?: boolean | null;
					is_measurable?: boolean | null;
					name?: string;
					unit_of_measure?: string | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "goal_types_category_id_fkey";
						columns: ["category_id"];
						isOneToOne: false;
						referencedRelation: "goal_categories";
						referencedColumns: ["id"];
					},
				];
			};
			passkey: {
				Row: {
					aaguid: string | null;
					backedUp: boolean;
					counter: number;
					createdAt: string | null;
					credentialID: string;
					deviceType: string;
					id: string;
					name: string | null;
					publicKey: string;
					transports: string | null;
					userId: string;
				};
				Insert: {
					aaguid?: string | null;
					backedUp: boolean;
					counter: number;
					createdAt?: string | null;
					credentialID: string;
					deviceType: string;
					id: string;
					name?: string | null;
					publicKey: string;
					transports?: string | null;
					userId: string;
				};
				Update: {
					aaguid?: string | null;
					backedUp?: boolean;
					counter?: number;
					createdAt?: string | null;
					credentialID?: string;
					deviceType?: string;
					id?: string;
					name?: string | null;
					publicKey?: string;
					transports?: string | null;
					userId?: string;
				};
				Relationships: [
					{
						foreignKeyName: "passkey_userId_fkey";
						columns: ["userId"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			payment_plans: {
				Row: {
					client_id: string;
					created_at: string | null;
					created_by: string | null;
					id: string;
					is_deferred_pif: boolean | null;
					number_of_payments: number;
					payment_amount: number;
					payment_frequency: Database["public"]["Enums"]["payment_frequency_enum"];
					payment_source: string | null;
					payment_type: string | null;
					start_date: string;
					term_end_date: string;
					total_amount: number;
				};
				Insert: {
					client_id: string;
					created_at?: string | null;
					created_by?: string | null;
					id?: string;
					is_deferred_pif?: boolean | null;
					number_of_payments: number;
					payment_amount: number;
					payment_frequency: Database["public"]["Enums"]["payment_frequency_enum"];
					payment_source?: string | null;
					payment_type?: string | null;
					start_date: string;
					term_end_date: string;
					total_amount: number;
				};
				Update: {
					client_id?: string;
					created_at?: string | null;
					created_by?: string | null;
					id?: string;
					is_deferred_pif?: boolean | null;
					number_of_payments?: number;
					payment_amount?: number;
					payment_frequency?: Database["public"]["Enums"]["payment_frequency_enum"];
					payment_source?: string | null;
					payment_type?: string | null;
					start_date?: string;
					term_end_date?: string;
					total_amount?: number;
				};
				Relationships: [
					{
						foreignKeyName: "payment_plans_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "payment_plans_created_by_fkey";
						columns: ["created_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			payments: {
				Row: {
					amount: number;
					client_id: string;
					created_at: string | null;
					due_date: string;
					id: string;
					payment_date: string;
					payment_method: string | null;
					payment_plan_id: string;
					status: Database["public"]["Enums"]["payment_status_enum"];
					stripe_transaction_id: string | null;
				};
				Insert: {
					amount: number;
					client_id: string;
					created_at?: string | null;
					due_date: string;
					id?: string;
					payment_date: string;
					payment_method?: string | null;
					payment_plan_id: string;
					status: Database["public"]["Enums"]["payment_status_enum"];
					stripe_transaction_id?: string | null;
				};
				Update: {
					amount?: number;
					client_id?: string;
					created_at?: string | null;
					due_date?: string;
					id?: string;
					payment_date?: string;
					payment_method?: string | null;
					payment_plan_id?: string;
					status?: Database["public"]["Enums"]["payment_status_enum"];
					stripe_transaction_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "payments_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "payments_payment_plan_id_fkey";
						columns: ["payment_plan_id"];
						isOneToOne: false;
						referencedRelation: "payment_plans";
						referencedColumns: ["id"];
					},
				];
			};
			products: {
				Row: {
					client_unit: number;
					created_at: string | null;
					default_duration_months: number | null;
					description: string | null;
					id: string;
					is_active: boolean | null;
					name: string;
				};
				Insert: {
					client_unit?: number;
					created_at?: string | null;
					default_duration_months?: number | null;
					description?: string | null;
					id?: string;
					is_active?: boolean | null;
					name: string;
				};
				Update: {
					client_unit?: number;
					created_at?: string | null;
					default_duration_months?: number | null;
					description?: string | null;
					id?: string;
					is_active?: boolean | null;
					name?: string;
				};
				Relationships: [];
			};
			roles: {
				Row: {
					created_at: string | null;
					description: string | null;
					id: string;
					name: string;
					permissions: Json | null;
				};
				Insert: {
					created_at?: string | null;
					description?: string | null;
					id?: string;
					name: string;
					permissions?: Json | null;
				};
				Update: {
					created_at?: string | null;
					description?: string | null;
					id?: string;
					name?: string;
					permissions?: Json | null;
				};
				Relationships: [];
			};
			session: {
				Row: {
					createdAt: string;
					expiresAt: string;
					id: string;
					impersonatedBy: string | null;
					ipAddress: string | null;
					token: string;
					updatedAt: string;
					userAgent: string | null;
					userId: string;
				};
				Insert: {
					createdAt: string;
					expiresAt: string;
					id: string;
					impersonatedBy?: string | null;
					ipAddress?: string | null;
					token: string;
					updatedAt: string;
					userAgent?: string | null;
					userId: string;
				};
				Update: {
					createdAt?: string;
					expiresAt?: string;
					id?: string;
					impersonatedBy?: string | null;
					ipAddress?: string | null;
					token?: string;
					updatedAt?: string;
					userAgent?: string | null;
					userId?: string;
				};
				Relationships: [
					{
						foreignKeyName: "session_userId_fkey";
						columns: ["userId"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			specialization_categories: {
				Row: {
					created_at: string | null;
					description: string | null;
					id: string;
					is_active: boolean | null;
					name: string;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					description?: string | null;
					id?: string;
					is_active?: boolean | null;
					name: string;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					description?: string | null;
					id?: string;
					is_active?: boolean | null;
					name?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			specializations: {
				Row: {
					category: string | null;
					category_id: string | null;
					created_at: string | null;
					description: string | null;
					icon: string | null;
					id: string;
					is_active: boolean | null;
					name: string;
					updated_at: string | null;
				};
				Insert: {
					category?: string | null;
					category_id?: string | null;
					created_at?: string | null;
					description?: string | null;
					icon?: string | null;
					id?: string;
					is_active?: boolean | null;
					name: string;
					updated_at?: string | null;
				};
				Update: {
					category?: string | null;
					category_id?: string | null;
					created_at?: string | null;
					description?: string | null;
					icon?: string | null;
					id?: string;
					is_active?: boolean | null;
					name?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "specializations_category_id_fkey";
						columns: ["category_id"];
						isOneToOne: false;
						referencedRelation: "specialization_categories";
						referencedColumns: ["id"];
					},
				];
			};
			system_settings: {
				Row: {
					data_type: string;
					description: string | null;
					id: string;
					setting_key: string;
					setting_value: string;
					updated_at: string | null;
					updated_by: string | null;
				};
				Insert: {
					data_type: string;
					description?: string | null;
					id?: string;
					setting_key: string;
					setting_value: string;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Update: {
					data_type?: string;
					description?: string | null;
					id?: string;
					setting_key?: string;
					setting_value?: string;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "system_settings_updated_by_fkey";
						columns: ["updated_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			ticket_comments: {
				Row: {
					comment: string;
					created_at: string | null;
					id: string;
					is_internal: boolean | null;
					ticket_id: string;
					user_id: string;
				};
				Insert: {
					comment: string;
					created_at?: string | null;
					id?: string;
					is_internal?: boolean | null;
					ticket_id: string;
					user_id: string;
				};
				Update: {
					comment?: string;
					created_at?: string | null;
					id?: string;
					is_internal?: boolean | null;
					ticket_id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "ticket_comments_ticket_id_fkey";
						columns: ["ticket_id"];
						isOneToOne: false;
						referencedRelation: "tickets";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "ticket_comments_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			tickets: {
				Row: {
					assigned_to: string | null;
					client_id: string | null;
					closed_at: string | null;
					created_at: string | null;
					created_by: string;
					description: string | null;
					id: string;
					is_executive: boolean | null;
					priority: Database["public"]["Enums"]["ticket_priority_enum"] | null;
					reminder_date: string | null;
					resolved_at: string | null;
					status: Database["public"]["Enums"]["ticket_status_enum"] | null;
					ticket_type: Database["public"]["Enums"]["ticket_type_enum"];
					title: string;
					unpause_date: string | null;
					updated_at: string | null;
				};
				Insert: {
					assigned_to?: string | null;
					client_id?: string | null;
					closed_at?: string | null;
					created_at?: string | null;
					created_by: string;
					description?: string | null;
					id?: string;
					is_executive?: boolean | null;
					priority?: Database["public"]["Enums"]["ticket_priority_enum"] | null;
					reminder_date?: string | null;
					resolved_at?: string | null;
					status?: Database["public"]["Enums"]["ticket_status_enum"] | null;
					ticket_type: Database["public"]["Enums"]["ticket_type_enum"];
					title: string;
					unpause_date?: string | null;
					updated_at?: string | null;
				};
				Update: {
					assigned_to?: string | null;
					client_id?: string | null;
					closed_at?: string | null;
					created_at?: string | null;
					created_by?: string;
					description?: string | null;
					id?: string;
					is_executive?: boolean | null;
					priority?: Database["public"]["Enums"]["ticket_priority_enum"] | null;
					reminder_date?: string | null;
					resolved_at?: string | null;
					status?: Database["public"]["Enums"]["ticket_status_enum"] | null;
					ticket_type?: Database["public"]["Enums"]["ticket_type_enum"];
					title?: string;
					unpause_date?: string | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "tickets_assigned_to_fkey";
						columns: ["assigned_to"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tickets_client_id_fkey";
						columns: ["client_id"];
						isOneToOne: false;
						referencedRelation: "clients";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tickets_created_by_fkey";
						columns: ["created_by"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			user: {
				Row: {
					banExpires: string | null;
					banned: boolean | null;
					banReason: string | null;
					bio: string | null;
					calendar_link: string | null;
					createdAt: string;
					email: string;
					emailVerified: boolean;
					id: string;
					image: string | null;
					name: string;
					role: string | null;
					updatedAt: string;
				};
				Insert: {
					banExpires?: string | null;
					banned?: boolean | null;
					banReason?: string | null;
					bio?: string | null;
					calendar_link?: string | null;
					createdAt: string;
					email: string;
					emailVerified: boolean;
					id: string;
					image?: string | null;
					name: string;
					role?: string | null;
					updatedAt: string;
				};
				Update: {
					banExpires?: string | null;
					banned?: boolean | null;
					banReason?: string | null;
					bio?: string | null;
					calendar_link?: string | null;
					createdAt?: string;
					email?: string;
					emailVerified?: boolean;
					id?: string;
					image?: string | null;
					name?: string;
					role?: string | null;
					updatedAt?: string;
				};
				Relationships: [];
			};
			user_certifications: {
				Row: {
					certificate_url: string | null;
					certification_id: string;
					created_at: string | null;
					date_achieved: string;
					expiry_date: string | null;
					id: string;
					user_id: string;
					verified: boolean | null;
				};
				Insert: {
					certificate_url?: string | null;
					certification_id: string;
					created_at?: string | null;
					date_achieved: string;
					expiry_date?: string | null;
					id?: string;
					user_id: string;
					verified?: boolean | null;
				};
				Update: {
					certificate_url?: string | null;
					certification_id?: string;
					created_at?: string | null;
					date_achieved?: string;
					expiry_date?: string | null;
					id?: string;
					user_id?: string;
					verified?: boolean | null;
				};
				Relationships: [
					{
						foreignKeyName: "user_certifications_certification_id_fkey";
						columns: ["certification_id"];
						isOneToOne: false;
						referencedRelation: "certifications";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "user_certifications_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			user_specializations: {
				Row: {
					created_at: string | null;
					id: string;
					is_primary: boolean | null;
					specialization_id: string;
					user_id: string;
					years_experience: number | null;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					is_primary?: boolean | null;
					specialization_id: string;
					user_id: string;
					years_experience?: number | null;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					is_primary?: boolean | null;
					specialization_id?: string;
					user_id?: string;
					years_experience?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: "user_specializations_specialization_id_fkey";
						columns: ["specialization_id"];
						isOneToOne: false;
						referencedRelation: "specializations";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "user_specializations_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "user";
						referencedColumns: ["id"];
					},
				];
			};
			verification: {
				Row: {
					createdAt: string | null;
					expiresAt: string;
					id: string;
					identifier: string;
					updatedAt: string | null;
					value: string;
				};
				Insert: {
					createdAt?: string | null;
					expiresAt: string;
					id: string;
					identifier: string;
					updatedAt?: string | null;
					value: string;
				};
				Update: {
					createdAt?: string | null;
					expiresAt?: string;
					id?: string;
					identifier?: string;
					updatedAt?: string | null;
					value?: string;
				};
				Relationships: [];
			};
			win_tags: {
				Row: {
					color: string | null;
					created_at: string | null;
					id: string;
					name: string;
				};
				Insert: {
					color?: string | null;
					created_at?: string | null;
					id?: string;
					name: string;
				};
				Update: {
					color?: string | null;
					created_at?: string | null;
					id?: string;
					name?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			calculate_client_units: {
				Args: { client_uuid: string };
				Returns: number;
			};
			current_user_id: {
				Args: Record<PropertyKey, never>;
				Returns: string;
			};
			get_active_subscriptions_by_type: {
				Args: Record<PropertyKey, never>;
				Returns: {
					subscription_type: string;
					subscription_count: number;
				}[];
			};
			get_client_id_from_record: {
				Args: { table_name: string; record_data: Json };
				Returns: string;
			};
			get_stripe_customers: {
				Args: { limit_count?: number };
				Returns: {
					id: string;
					customer_id: string;
					email: string;
					name: string;
				}[];
			};
			get_stripe_customers_test: {
				Args: Record<PropertyKey, never>;
				Returns: {
					id: string;
					email: string;
					name: string;
					description: string;
					created: string;
				}[];
			};
			get_stripe_financial_metrics: {
				Args: {
					p_start_date?: string;
					p_end_date?: string;
					p_previous_period_days?: number;
				};
				Returns: Json;
			};
			get_stripe_sales_performance: {
				Args: { p_days?: number };
				Returns: Json;
			};
			set_user_id: {
				Args: { user_id: string };
				Returns: undefined;
			};
			trigger_client_unit_webhook: {
				Args: { client_uuid: string };
				Returns: undefined;
			};
		};
		Enums: {
			audit_action_enum: "INSERT" | "UPDATE" | "DELETE";
			call_type_enum: "onboarding" | "check_in" | "monthly" | "other";
			payment_frequency_enum: "monthly" | "bi_weekly" | "weekly" | "one_time";
			payment_status_enum: "pending" | "completed" | "failed" | "refunded";
			testimonial_type_enum: "video" | "text" | "google_review" | "other";
			ticket_priority_enum: "low" | "medium" | "high" | "urgent";
			ticket_status_enum:
				| "open"
				| "in_progress"
				| "resolved"
				| "closed"
				| "paused";
			ticket_type_enum:
				| "billing"
				| "tech_problem"
				| "escalation"
				| "coaching_transfer"
				| "retention"
				| "pausing"
				| "other";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	stripe: {
		Tables: {
			charges: {
				Row: {
					amount: number | null;
					amount_refunded: number | null;
					application: string | null;
					application_fee: string | null;
					balance_transaction: string | null;
					captured: boolean | null;
					created: number | null;
					currency: string | null;
					customer: string | null;
					description: string | null;
					destination: string | null;
					dispute: string | null;
					failure_code: string | null;
					failure_message: string | null;
					fraud_details: Json | null;
					id: string;
					invoice: string | null;
					livemode: boolean | null;
					metadata: Json | null;
					object: string | null;
					on_behalf_of: string | null;
					order: string | null;
					outcome: Json | null;
					paid: boolean | null;
					payment_intent: string | null;
					payment_method_details: Json | null;
					receipt_email: string | null;
					receipt_number: string | null;
					refunded: boolean | null;
					refunds: Json | null;
					review: string | null;
					shipping: Json | null;
					source: Json | null;
					source_transfer: string | null;
					statement_descriptor: string | null;
					status: string | null;
					transfer_group: string | null;
					updated: number | null;
					updated_at: string;
				};
				Insert: {
					amount?: number | null;
					amount_refunded?: number | null;
					application?: string | null;
					application_fee?: string | null;
					balance_transaction?: string | null;
					captured?: boolean | null;
					created?: number | null;
					currency?: string | null;
					customer?: string | null;
					description?: string | null;
					destination?: string | null;
					dispute?: string | null;
					failure_code?: string | null;
					failure_message?: string | null;
					fraud_details?: Json | null;
					id: string;
					invoice?: string | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					object?: string | null;
					on_behalf_of?: string | null;
					order?: string | null;
					outcome?: Json | null;
					paid?: boolean | null;
					payment_intent?: string | null;
					payment_method_details?: Json | null;
					receipt_email?: string | null;
					receipt_number?: string | null;
					refunded?: boolean | null;
					refunds?: Json | null;
					review?: string | null;
					shipping?: Json | null;
					source?: Json | null;
					source_transfer?: string | null;
					statement_descriptor?: string | null;
					status?: string | null;
					transfer_group?: string | null;
					updated?: number | null;
					updated_at?: string;
				};
				Update: {
					amount?: number | null;
					amount_refunded?: number | null;
					application?: string | null;
					application_fee?: string | null;
					balance_transaction?: string | null;
					captured?: boolean | null;
					created?: number | null;
					currency?: string | null;
					customer?: string | null;
					description?: string | null;
					destination?: string | null;
					dispute?: string | null;
					failure_code?: string | null;
					failure_message?: string | null;
					fraud_details?: Json | null;
					id?: string;
					invoice?: string | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					object?: string | null;
					on_behalf_of?: string | null;
					order?: string | null;
					outcome?: Json | null;
					paid?: boolean | null;
					payment_intent?: string | null;
					payment_method_details?: Json | null;
					receipt_email?: string | null;
					receipt_number?: string | null;
					refunded?: boolean | null;
					refunds?: Json | null;
					review?: string | null;
					shipping?: Json | null;
					source?: Json | null;
					source_transfer?: string | null;
					statement_descriptor?: string | null;
					status?: string | null;
					transfer_group?: string | null;
					updated?: number | null;
					updated_at?: string;
				};
				Relationships: [];
			};
			coupons: {
				Row: {
					amount_off: number | null;
					created: number | null;
					currency: string | null;
					duration: string | null;
					duration_in_months: number | null;
					id: string;
					livemode: boolean | null;
					max_redemptions: number | null;
					metadata: Json | null;
					name: string | null;
					object: string | null;
					percent_off: number | null;
					percent_off_precise: number | null;
					redeem_by: number | null;
					times_redeemed: number | null;
					updated: number | null;
					updated_at: string;
					valid: boolean | null;
				};
				Insert: {
					amount_off?: number | null;
					created?: number | null;
					currency?: string | null;
					duration?: string | null;
					duration_in_months?: number | null;
					id: string;
					livemode?: boolean | null;
					max_redemptions?: number | null;
					metadata?: Json | null;
					name?: string | null;
					object?: string | null;
					percent_off?: number | null;
					percent_off_precise?: number | null;
					redeem_by?: number | null;
					times_redeemed?: number | null;
					updated?: number | null;
					updated_at?: string;
					valid?: boolean | null;
				};
				Update: {
					amount_off?: number | null;
					created?: number | null;
					currency?: string | null;
					duration?: string | null;
					duration_in_months?: number | null;
					id?: string;
					livemode?: boolean | null;
					max_redemptions?: number | null;
					metadata?: Json | null;
					name?: string | null;
					object?: string | null;
					percent_off?: number | null;
					percent_off_precise?: number | null;
					redeem_by?: number | null;
					times_redeemed?: number | null;
					updated?: number | null;
					updated_at?: string;
					valid?: boolean | null;
				};
				Relationships: [];
			};
			credit_notes: {
				Row: {
					amount: number | null;
					amount_shipping: number | null;
					created: number | null;
					currency: string | null;
					customer: string | null;
					customer_balance_transaction: string | null;
					discount_amount: number | null;
					discount_amounts: Json | null;
					id: string;
					invoice: string | null;
					lines: Json | null;
					livemode: boolean | null;
					memo: string | null;
					metadata: Json | null;
					number: string | null;
					object: string | null;
					out_of_band_amount: number | null;
					pdf: string | null;
					reason: string | null;
					refund: string | null;
					shipping_cost: Json | null;
					status: string | null;
					subtotal: number | null;
					subtotal_excluding_tax: number | null;
					tax_amounts: Json | null;
					total: number | null;
					total_excluding_tax: number | null;
					type: string | null;
					voided_at: string | null;
				};
				Insert: {
					amount?: number | null;
					amount_shipping?: number | null;
					created?: number | null;
					currency?: string | null;
					customer?: string | null;
					customer_balance_transaction?: string | null;
					discount_amount?: number | null;
					discount_amounts?: Json | null;
					id: string;
					invoice?: string | null;
					lines?: Json | null;
					livemode?: boolean | null;
					memo?: string | null;
					metadata?: Json | null;
					number?: string | null;
					object?: string | null;
					out_of_band_amount?: number | null;
					pdf?: string | null;
					reason?: string | null;
					refund?: string | null;
					shipping_cost?: Json | null;
					status?: string | null;
					subtotal?: number | null;
					subtotal_excluding_tax?: number | null;
					tax_amounts?: Json | null;
					total?: number | null;
					total_excluding_tax?: number | null;
					type?: string | null;
					voided_at?: string | null;
				};
				Update: {
					amount?: number | null;
					amount_shipping?: number | null;
					created?: number | null;
					currency?: string | null;
					customer?: string | null;
					customer_balance_transaction?: string | null;
					discount_amount?: number | null;
					discount_amounts?: Json | null;
					id?: string;
					invoice?: string | null;
					lines?: Json | null;
					livemode?: boolean | null;
					memo?: string | null;
					metadata?: Json | null;
					number?: string | null;
					object?: string | null;
					out_of_band_amount?: number | null;
					pdf?: string | null;
					reason?: string | null;
					refund?: string | null;
					shipping_cost?: Json | null;
					status?: string | null;
					subtotal?: number | null;
					subtotal_excluding_tax?: number | null;
					tax_amounts?: Json | null;
					total?: number | null;
					total_excluding_tax?: number | null;
					type?: string | null;
					voided_at?: string | null;
				};
				Relationships: [];
			};
			customers: {
				Row: {
					address: Json | null;
					balance: number | null;
					created: number | null;
					currency: string | null;
					default_source: string | null;
					deleted: boolean;
					delinquent: boolean | null;
					description: string | null;
					discount: Json | null;
					email: string | null;
					id: string;
					invoice_prefix: string | null;
					invoice_settings: Json | null;
					livemode: boolean | null;
					metadata: Json | null;
					name: string | null;
					next_invoice_sequence: number | null;
					object: string | null;
					phone: string | null;
					preferred_locales: Json | null;
					shipping: Json | null;
					tax_exempt: string | null;
					updated_at: string;
				};
				Insert: {
					address?: Json | null;
					balance?: number | null;
					created?: number | null;
					currency?: string | null;
					default_source?: string | null;
					deleted?: boolean;
					delinquent?: boolean | null;
					description?: string | null;
					discount?: Json | null;
					email?: string | null;
					id: string;
					invoice_prefix?: string | null;
					invoice_settings?: Json | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					name?: string | null;
					next_invoice_sequence?: number | null;
					object?: string | null;
					phone?: string | null;
					preferred_locales?: Json | null;
					shipping?: Json | null;
					tax_exempt?: string | null;
					updated_at?: string;
				};
				Update: {
					address?: Json | null;
					balance?: number | null;
					created?: number | null;
					currency?: string | null;
					default_source?: string | null;
					deleted?: boolean;
					delinquent?: boolean | null;
					description?: string | null;
					discount?: Json | null;
					email?: string | null;
					id?: string;
					invoice_prefix?: string | null;
					invoice_settings?: Json | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					name?: string | null;
					next_invoice_sequence?: number | null;
					object?: string | null;
					phone?: string | null;
					preferred_locales?: Json | null;
					shipping?: Json | null;
					tax_exempt?: string | null;
					updated_at?: string;
				};
				Relationships: [];
			};
			disputes: {
				Row: {
					amount: number | null;
					balance_transactions: Json | null;
					charge: string | null;
					created: number | null;
					currency: string | null;
					evidence: Json | null;
					evidence_details: Json | null;
					id: string;
					is_charge_refundable: boolean | null;
					livemode: boolean | null;
					metadata: Json | null;
					object: string | null;
					payment_intent: string | null;
					reason: string | null;
					status: string | null;
					updated: number | null;
					updated_at: string;
				};
				Insert: {
					amount?: number | null;
					balance_transactions?: Json | null;
					charge?: string | null;
					created?: number | null;
					currency?: string | null;
					evidence?: Json | null;
					evidence_details?: Json | null;
					id: string;
					is_charge_refundable?: boolean | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					object?: string | null;
					payment_intent?: string | null;
					reason?: string | null;
					status?: string | null;
					updated?: number | null;
					updated_at?: string;
				};
				Update: {
					amount?: number | null;
					balance_transactions?: Json | null;
					charge?: string | null;
					created?: number | null;
					currency?: string | null;
					evidence?: Json | null;
					evidence_details?: Json | null;
					id?: string;
					is_charge_refundable?: boolean | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					object?: string | null;
					payment_intent?: string | null;
					reason?: string | null;
					status?: string | null;
					updated?: number | null;
					updated_at?: string;
				};
				Relationships: [];
			};
			early_fraud_warnings: {
				Row: {
					actionable: boolean | null;
					charge: string | null;
					created: number | null;
					fraud_type: string | null;
					id: string;
					livemode: boolean | null;
					object: string | null;
					payment_intent: string | null;
					updated_at: string;
				};
				Insert: {
					actionable?: boolean | null;
					charge?: string | null;
					created?: number | null;
					fraud_type?: string | null;
					id: string;
					livemode?: boolean | null;
					object?: string | null;
					payment_intent?: string | null;
					updated_at?: string;
				};
				Update: {
					actionable?: boolean | null;
					charge?: string | null;
					created?: number | null;
					fraud_type?: string | null;
					id?: string;
					livemode?: boolean | null;
					object?: string | null;
					payment_intent?: string | null;
					updated_at?: string;
				};
				Relationships: [];
			};
			events: {
				Row: {
					api_version: string | null;
					created: number | null;
					data: Json | null;
					id: string;
					livemode: boolean | null;
					object: string | null;
					pending_webhooks: number | null;
					request: string | null;
					type: string | null;
					updated: number | null;
					updated_at: string;
				};
				Insert: {
					api_version?: string | null;
					created?: number | null;
					data?: Json | null;
					id: string;
					livemode?: boolean | null;
					object?: string | null;
					pending_webhooks?: number | null;
					request?: string | null;
					type?: string | null;
					updated?: number | null;
					updated_at?: string;
				};
				Update: {
					api_version?: string | null;
					created?: number | null;
					data?: Json | null;
					id?: string;
					livemode?: boolean | null;
					object?: string | null;
					pending_webhooks?: number | null;
					request?: string | null;
					type?: string | null;
					updated?: number | null;
					updated_at?: string;
				};
				Relationships: [];
			};
			invoices: {
				Row: {
					account_country: string | null;
					account_name: string | null;
					account_tax_ids: Json | null;
					amount_due: number | null;
					amount_paid: number | null;
					amount_remaining: number | null;
					application_fee_amount: number | null;
					attempt_count: number | null;
					attempted: boolean | null;
					auto_advance: boolean | null;
					billing_reason: string | null;
					charge: string | null;
					collection_method: string | null;
					created: number | null;
					currency: string | null;
					custom_fields: Json | null;
					customer: string | null;
					customer_address: Json | null;
					customer_email: string | null;
					customer_name: string | null;
					customer_phone: string | null;
					customer_shipping: Json | null;
					customer_tax_exempt: string | null;
					customer_tax_ids: Json | null;
					default_payment_method: string | null;
					default_source: string | null;
					default_tax_rates: Json | null;
					description: string | null;
					discount: Json | null;
					discounts: Json | null;
					due_date: number | null;
					ending_balance: number | null;
					footer: string | null;
					hosted_invoice_url: string | null;
					id: string;
					invoice_pdf: string | null;
					last_finalization_error: Json | null;
					lines: Json | null;
					livemode: boolean | null;
					metadata: Json | null;
					next_payment_attempt: number | null;
					number: string | null;
					object: string | null;
					on_behalf_of: string | null;
					paid: boolean | null;
					payment_intent: string | null;
					payment_settings: Json | null;
					period_end: number | null;
					period_start: number | null;
					post_payment_credit_notes_amount: number | null;
					pre_payment_credit_notes_amount: number | null;
					receipt_number: string | null;
					starting_balance: number | null;
					statement_descriptor: string | null;
					status: Database["stripe"]["Enums"]["invoice_status"] | null;
					status_transitions: Json | null;
					subscription: string | null;
					subtotal: number | null;
					tax: number | null;
					total: number | null;
					total_discount_amounts: Json | null;
					total_tax_amounts: Json | null;
					transfer_data: Json | null;
					updated_at: string;
					webhooks_delivered_at: number | null;
				};
				Insert: {
					account_country?: string | null;
					account_name?: string | null;
					account_tax_ids?: Json | null;
					amount_due?: number | null;
					amount_paid?: number | null;
					amount_remaining?: number | null;
					application_fee_amount?: number | null;
					attempt_count?: number | null;
					attempted?: boolean | null;
					auto_advance?: boolean | null;
					billing_reason?: string | null;
					charge?: string | null;
					collection_method?: string | null;
					created?: number | null;
					currency?: string | null;
					custom_fields?: Json | null;
					customer?: string | null;
					customer_address?: Json | null;
					customer_email?: string | null;
					customer_name?: string | null;
					customer_phone?: string | null;
					customer_shipping?: Json | null;
					customer_tax_exempt?: string | null;
					customer_tax_ids?: Json | null;
					default_payment_method?: string | null;
					default_source?: string | null;
					default_tax_rates?: Json | null;
					description?: string | null;
					discount?: Json | null;
					discounts?: Json | null;
					due_date?: number | null;
					ending_balance?: number | null;
					footer?: string | null;
					hosted_invoice_url?: string | null;
					id: string;
					invoice_pdf?: string | null;
					last_finalization_error?: Json | null;
					lines?: Json | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					next_payment_attempt?: number | null;
					number?: string | null;
					object?: string | null;
					on_behalf_of?: string | null;
					paid?: boolean | null;
					payment_intent?: string | null;
					payment_settings?: Json | null;
					period_end?: number | null;
					period_start?: number | null;
					post_payment_credit_notes_amount?: number | null;
					pre_payment_credit_notes_amount?: number | null;
					receipt_number?: string | null;
					starting_balance?: number | null;
					statement_descriptor?: string | null;
					status?: Database["stripe"]["Enums"]["invoice_status"] | null;
					status_transitions?: Json | null;
					subscription?: string | null;
					subtotal?: number | null;
					tax?: number | null;
					total?: number | null;
					total_discount_amounts?: Json | null;
					total_tax_amounts?: Json | null;
					transfer_data?: Json | null;
					updated_at?: string;
					webhooks_delivered_at?: number | null;
				};
				Update: {
					account_country?: string | null;
					account_name?: string | null;
					account_tax_ids?: Json | null;
					amount_due?: number | null;
					amount_paid?: number | null;
					amount_remaining?: number | null;
					application_fee_amount?: number | null;
					attempt_count?: number | null;
					attempted?: boolean | null;
					auto_advance?: boolean | null;
					billing_reason?: string | null;
					charge?: string | null;
					collection_method?: string | null;
					created?: number | null;
					currency?: string | null;
					custom_fields?: Json | null;
					customer?: string | null;
					customer_address?: Json | null;
					customer_email?: string | null;
					customer_name?: string | null;
					customer_phone?: string | null;
					customer_shipping?: Json | null;
					customer_tax_exempt?: string | null;
					customer_tax_ids?: Json | null;
					default_payment_method?: string | null;
					default_source?: string | null;
					default_tax_rates?: Json | null;
					description?: string | null;
					discount?: Json | null;
					discounts?: Json | null;
					due_date?: number | null;
					ending_balance?: number | null;
					footer?: string | null;
					hosted_invoice_url?: string | null;
					id?: string;
					invoice_pdf?: string | null;
					last_finalization_error?: Json | null;
					lines?: Json | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					next_payment_attempt?: number | null;
					number?: string | null;
					object?: string | null;
					on_behalf_of?: string | null;
					paid?: boolean | null;
					payment_intent?: string | null;
					payment_settings?: Json | null;
					period_end?: number | null;
					period_start?: number | null;
					post_payment_credit_notes_amount?: number | null;
					pre_payment_credit_notes_amount?: number | null;
					receipt_number?: string | null;
					starting_balance?: number | null;
					statement_descriptor?: string | null;
					status?: Database["stripe"]["Enums"]["invoice_status"] | null;
					status_transitions?: Json | null;
					subscription?: string | null;
					subtotal?: number | null;
					tax?: number | null;
					total?: number | null;
					total_discount_amounts?: Json | null;
					total_tax_amounts?: Json | null;
					transfer_data?: Json | null;
					updated_at?: string;
					webhooks_delivered_at?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: "invoices_customer_fkey";
						columns: ["customer"];
						isOneToOne: false;
						referencedRelation: "customers";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "invoices_subscription_fkey";
						columns: ["subscription"];
						isOneToOne: false;
						referencedRelation: "subscriptions";
						referencedColumns: ["id"];
					},
				];
			};
			payment_intents: {
				Row: {
					amount: number | null;
					amount_capturable: number | null;
					amount_details: Json | null;
					amount_received: number | null;
					application: string | null;
					application_fee_amount: number | null;
					automatic_payment_methods: string | null;
					canceled_at: number | null;
					cancellation_reason: string | null;
					capture_method: string | null;
					client_secret: string | null;
					confirmation_method: string | null;
					created: number | null;
					currency: string | null;
					customer: string | null;
					description: string | null;
					id: string;
					invoice: string | null;
					last_payment_error: string | null;
					livemode: boolean | null;
					metadata: Json | null;
					next_action: string | null;
					object: string | null;
					on_behalf_of: string | null;
					payment_method: string | null;
					payment_method_options: Json | null;
					payment_method_types: Json | null;
					processing: string | null;
					receipt_email: string | null;
					review: string | null;
					setup_future_usage: string | null;
					shipping: Json | null;
					statement_descriptor: string | null;
					statement_descriptor_suffix: string | null;
					status: string | null;
					transfer_data: Json | null;
					transfer_group: string | null;
				};
				Insert: {
					amount?: number | null;
					amount_capturable?: number | null;
					amount_details?: Json | null;
					amount_received?: number | null;
					application?: string | null;
					application_fee_amount?: number | null;
					automatic_payment_methods?: string | null;
					canceled_at?: number | null;
					cancellation_reason?: string | null;
					capture_method?: string | null;
					client_secret?: string | null;
					confirmation_method?: string | null;
					created?: number | null;
					currency?: string | null;
					customer?: string | null;
					description?: string | null;
					id: string;
					invoice?: string | null;
					last_payment_error?: string | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					next_action?: string | null;
					object?: string | null;
					on_behalf_of?: string | null;
					payment_method?: string | null;
					payment_method_options?: Json | null;
					payment_method_types?: Json | null;
					processing?: string | null;
					receipt_email?: string | null;
					review?: string | null;
					setup_future_usage?: string | null;
					shipping?: Json | null;
					statement_descriptor?: string | null;
					statement_descriptor_suffix?: string | null;
					status?: string | null;
					transfer_data?: Json | null;
					transfer_group?: string | null;
				};
				Update: {
					amount?: number | null;
					amount_capturable?: number | null;
					amount_details?: Json | null;
					amount_received?: number | null;
					application?: string | null;
					application_fee_amount?: number | null;
					automatic_payment_methods?: string | null;
					canceled_at?: number | null;
					cancellation_reason?: string | null;
					capture_method?: string | null;
					client_secret?: string | null;
					confirmation_method?: string | null;
					created?: number | null;
					currency?: string | null;
					customer?: string | null;
					description?: string | null;
					id?: string;
					invoice?: string | null;
					last_payment_error?: string | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					next_action?: string | null;
					object?: string | null;
					on_behalf_of?: string | null;
					payment_method?: string | null;
					payment_method_options?: Json | null;
					payment_method_types?: Json | null;
					processing?: string | null;
					receipt_email?: string | null;
					review?: string | null;
					setup_future_usage?: string | null;
					shipping?: Json | null;
					statement_descriptor?: string | null;
					statement_descriptor_suffix?: string | null;
					status?: string | null;
					transfer_data?: Json | null;
					transfer_group?: string | null;
				};
				Relationships: [];
			};
			payment_methods: {
				Row: {
					billing_details: Json | null;
					card: Json | null;
					created: number | null;
					customer: string | null;
					id: string;
					metadata: Json | null;
					object: string | null;
					type: string | null;
				};
				Insert: {
					billing_details?: Json | null;
					card?: Json | null;
					created?: number | null;
					customer?: string | null;
					id: string;
					metadata?: Json | null;
					object?: string | null;
					type?: string | null;
				};
				Update: {
					billing_details?: Json | null;
					card?: Json | null;
					created?: number | null;
					customer?: string | null;
					id?: string;
					metadata?: Json | null;
					object?: string | null;
					type?: string | null;
				};
				Relationships: [];
			};
			payouts: {
				Row: {
					amount: number | null;
					amount_reversed: number | null;
					arrival_date: string | null;
					automatic: boolean | null;
					balance_transaction: string | null;
					bank_account: Json | null;
					created: number | null;
					currency: string | null;
					date: string | null;
					description: string | null;
					destination: string | null;
					failure_balance_transaction: string | null;
					failure_code: string | null;
					failure_message: string | null;
					id: string;
					livemode: boolean | null;
					metadata: Json | null;
					method: string | null;
					object: string | null;
					recipient: string | null;
					source_transaction: string | null;
					source_type: string | null;
					statement_description: string | null;
					statement_descriptor: string | null;
					status: string | null;
					transfer_group: string | null;
					type: string | null;
					updated: number | null;
					updated_at: string;
				};
				Insert: {
					amount?: number | null;
					amount_reversed?: number | null;
					arrival_date?: string | null;
					automatic?: boolean | null;
					balance_transaction?: string | null;
					bank_account?: Json | null;
					created?: number | null;
					currency?: string | null;
					date?: string | null;
					description?: string | null;
					destination?: string | null;
					failure_balance_transaction?: string | null;
					failure_code?: string | null;
					failure_message?: string | null;
					id: string;
					livemode?: boolean | null;
					metadata?: Json | null;
					method?: string | null;
					object?: string | null;
					recipient?: string | null;
					source_transaction?: string | null;
					source_type?: string | null;
					statement_description?: string | null;
					statement_descriptor?: string | null;
					status?: string | null;
					transfer_group?: string | null;
					type?: string | null;
					updated?: number | null;
					updated_at?: string;
				};
				Update: {
					amount?: number | null;
					amount_reversed?: number | null;
					arrival_date?: string | null;
					automatic?: boolean | null;
					balance_transaction?: string | null;
					bank_account?: Json | null;
					created?: number | null;
					currency?: string | null;
					date?: string | null;
					description?: string | null;
					destination?: string | null;
					failure_balance_transaction?: string | null;
					failure_code?: string | null;
					failure_message?: string | null;
					id?: string;
					livemode?: boolean | null;
					metadata?: Json | null;
					method?: string | null;
					object?: string | null;
					recipient?: string | null;
					source_transaction?: string | null;
					source_type?: string | null;
					statement_description?: string | null;
					statement_descriptor?: string | null;
					status?: string | null;
					transfer_group?: string | null;
					type?: string | null;
					updated?: number | null;
					updated_at?: string;
				};
				Relationships: [];
			};
			plans: {
				Row: {
					active: boolean | null;
					aggregate_usage: string | null;
					amount: number | null;
					billing_scheme: string | null;
					created: number | null;
					currency: string | null;
					id: string;
					interval: string | null;
					interval_count: number | null;
					livemode: boolean | null;
					metadata: Json | null;
					nickname: string | null;
					object: string | null;
					product: string | null;
					tiers_mode: string | null;
					transform_usage: string | null;
					trial_period_days: number | null;
					updated_at: string;
					usage_type: string | null;
				};
				Insert: {
					active?: boolean | null;
					aggregate_usage?: string | null;
					amount?: number | null;
					billing_scheme?: string | null;
					created?: number | null;
					currency?: string | null;
					id: string;
					interval?: string | null;
					interval_count?: number | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					nickname?: string | null;
					object?: string | null;
					product?: string | null;
					tiers_mode?: string | null;
					transform_usage?: string | null;
					trial_period_days?: number | null;
					updated_at?: string;
					usage_type?: string | null;
				};
				Update: {
					active?: boolean | null;
					aggregate_usage?: string | null;
					amount?: number | null;
					billing_scheme?: string | null;
					created?: number | null;
					currency?: string | null;
					id?: string;
					interval?: string | null;
					interval_count?: number | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					nickname?: string | null;
					object?: string | null;
					product?: string | null;
					tiers_mode?: string | null;
					transform_usage?: string | null;
					trial_period_days?: number | null;
					updated_at?: string;
					usage_type?: string | null;
				};
				Relationships: [];
			};
			prices: {
				Row: {
					active: boolean | null;
					billing_scheme: string | null;
					created: number | null;
					currency: string | null;
					id: string;
					livemode: boolean | null;
					lookup_key: string | null;
					metadata: Json | null;
					nickname: string | null;
					object: string | null;
					product: string | null;
					recurring: Json | null;
					tiers_mode: Database["stripe"]["Enums"]["pricing_tiers"] | null;
					transform_quantity: Json | null;
					type: Database["stripe"]["Enums"]["pricing_type"] | null;
					unit_amount: number | null;
					unit_amount_decimal: string | null;
					updated_at: string;
				};
				Insert: {
					active?: boolean | null;
					billing_scheme?: string | null;
					created?: number | null;
					currency?: string | null;
					id: string;
					livemode?: boolean | null;
					lookup_key?: string | null;
					metadata?: Json | null;
					nickname?: string | null;
					object?: string | null;
					product?: string | null;
					recurring?: Json | null;
					tiers_mode?: Database["stripe"]["Enums"]["pricing_tiers"] | null;
					transform_quantity?: Json | null;
					type?: Database["stripe"]["Enums"]["pricing_type"] | null;
					unit_amount?: number | null;
					unit_amount_decimal?: string | null;
					updated_at?: string;
				};
				Update: {
					active?: boolean | null;
					billing_scheme?: string | null;
					created?: number | null;
					currency?: string | null;
					id?: string;
					livemode?: boolean | null;
					lookup_key?: string | null;
					metadata?: Json | null;
					nickname?: string | null;
					object?: string | null;
					product?: string | null;
					recurring?: Json | null;
					tiers_mode?: Database["stripe"]["Enums"]["pricing_tiers"] | null;
					transform_quantity?: Json | null;
					type?: Database["stripe"]["Enums"]["pricing_type"] | null;
					unit_amount?: number | null;
					unit_amount_decimal?: string | null;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "prices_product_fkey";
						columns: ["product"];
						isOneToOne: false;
						referencedRelation: "products";
						referencedColumns: ["id"];
					},
				];
			};
			products: {
				Row: {
					active: boolean | null;
					created: number | null;
					default_price: string | null;
					description: string | null;
					id: string;
					images: Json | null;
					livemode: boolean | null;
					marketing_features: Json | null;
					metadata: Json | null;
					name: string | null;
					object: string | null;
					package_dimensions: Json | null;
					shippable: boolean | null;
					statement_descriptor: string | null;
					unit_label: string | null;
					updated: number | null;
					updated_at: string;
					url: string | null;
				};
				Insert: {
					active?: boolean | null;
					created?: number | null;
					default_price?: string | null;
					description?: string | null;
					id: string;
					images?: Json | null;
					livemode?: boolean | null;
					marketing_features?: Json | null;
					metadata?: Json | null;
					name?: string | null;
					object?: string | null;
					package_dimensions?: Json | null;
					shippable?: boolean | null;
					statement_descriptor?: string | null;
					unit_label?: string | null;
					updated?: number | null;
					updated_at?: string;
					url?: string | null;
				};
				Update: {
					active?: boolean | null;
					created?: number | null;
					default_price?: string | null;
					description?: string | null;
					id?: string;
					images?: Json | null;
					livemode?: boolean | null;
					marketing_features?: Json | null;
					metadata?: Json | null;
					name?: string | null;
					object?: string | null;
					package_dimensions?: Json | null;
					shippable?: boolean | null;
					statement_descriptor?: string | null;
					unit_label?: string | null;
					updated?: number | null;
					updated_at?: string;
					url?: string | null;
				};
				Relationships: [];
			};
			refunds: {
				Row: {
					amount: number | null;
					balance_transaction: string | null;
					charge: string | null;
					created: number | null;
					currency: string | null;
					destination_details: Json | null;
					id: string;
					metadata: Json | null;
					object: string | null;
					payment_intent: string | null;
					reason: string | null;
					receipt_number: string | null;
					source_transfer_reversal: string | null;
					status: string | null;
					transfer_reversal: string | null;
					updated_at: string;
				};
				Insert: {
					amount?: number | null;
					balance_transaction?: string | null;
					charge?: string | null;
					created?: number | null;
					currency?: string | null;
					destination_details?: Json | null;
					id: string;
					metadata?: Json | null;
					object?: string | null;
					payment_intent?: string | null;
					reason?: string | null;
					receipt_number?: string | null;
					source_transfer_reversal?: string | null;
					status?: string | null;
					transfer_reversal?: string | null;
					updated_at?: string;
				};
				Update: {
					amount?: number | null;
					balance_transaction?: string | null;
					charge?: string | null;
					created?: number | null;
					currency?: string | null;
					destination_details?: Json | null;
					id?: string;
					metadata?: Json | null;
					object?: string | null;
					payment_intent?: string | null;
					reason?: string | null;
					receipt_number?: string | null;
					source_transfer_reversal?: string | null;
					status?: string | null;
					transfer_reversal?: string | null;
					updated_at?: string;
				};
				Relationships: [];
			};
			reviews: {
				Row: {
					billing_zip: string | null;
					charge: string | null;
					closed_reason: string | null;
					created: number | null;
					id: string;
					ip_address: string | null;
					ip_address_location: Json | null;
					livemode: boolean | null;
					object: string | null;
					open: boolean | null;
					opened_reason: string | null;
					payment_intent: string | null;
					reason: string | null;
					session: string | null;
					updated_at: string;
				};
				Insert: {
					billing_zip?: string | null;
					charge?: string | null;
					closed_reason?: string | null;
					created?: number | null;
					id: string;
					ip_address?: string | null;
					ip_address_location?: Json | null;
					livemode?: boolean | null;
					object?: string | null;
					open?: boolean | null;
					opened_reason?: string | null;
					payment_intent?: string | null;
					reason?: string | null;
					session?: string | null;
					updated_at?: string;
				};
				Update: {
					billing_zip?: string | null;
					charge?: string | null;
					closed_reason?: string | null;
					created?: number | null;
					id?: string;
					ip_address?: string | null;
					ip_address_location?: Json | null;
					livemode?: boolean | null;
					object?: string | null;
					open?: boolean | null;
					opened_reason?: string | null;
					payment_intent?: string | null;
					reason?: string | null;
					session?: string | null;
					updated_at?: string;
				};
				Relationships: [];
			};
			setup_intents: {
				Row: {
					cancellation_reason: string | null;
					created: number | null;
					customer: string | null;
					description: string | null;
					id: string;
					latest_attempt: string | null;
					mandate: string | null;
					object: string | null;
					on_behalf_of: string | null;
					payment_method: string | null;
					single_use_mandate: string | null;
					status: string | null;
					usage: string | null;
				};
				Insert: {
					cancellation_reason?: string | null;
					created?: number | null;
					customer?: string | null;
					description?: string | null;
					id: string;
					latest_attempt?: string | null;
					mandate?: string | null;
					object?: string | null;
					on_behalf_of?: string | null;
					payment_method?: string | null;
					single_use_mandate?: string | null;
					status?: string | null;
					usage?: string | null;
				};
				Update: {
					cancellation_reason?: string | null;
					created?: number | null;
					customer?: string | null;
					description?: string | null;
					id?: string;
					latest_attempt?: string | null;
					mandate?: string | null;
					object?: string | null;
					on_behalf_of?: string | null;
					payment_method?: string | null;
					single_use_mandate?: string | null;
					status?: string | null;
					usage?: string | null;
				};
				Relationships: [];
			};
			subscription_items: {
				Row: {
					billing_thresholds: Json | null;
					created: number | null;
					current_period_end: number | null;
					current_period_start: number | null;
					deleted: boolean | null;
					id: string;
					metadata: Json | null;
					object: string | null;
					price: string | null;
					quantity: number | null;
					subscription: string | null;
					tax_rates: Json | null;
				};
				Insert: {
					billing_thresholds?: Json | null;
					created?: number | null;
					current_period_end?: number | null;
					current_period_start?: number | null;
					deleted?: boolean | null;
					id: string;
					metadata?: Json | null;
					object?: string | null;
					price?: string | null;
					quantity?: number | null;
					subscription?: string | null;
					tax_rates?: Json | null;
				};
				Update: {
					billing_thresholds?: Json | null;
					created?: number | null;
					current_period_end?: number | null;
					current_period_start?: number | null;
					deleted?: boolean | null;
					id?: string;
					metadata?: Json | null;
					object?: string | null;
					price?: string | null;
					quantity?: number | null;
					subscription?: string | null;
					tax_rates?: Json | null;
				};
				Relationships: [
					{
						foreignKeyName: "subscription_items_price_fkey";
						columns: ["price"];
						isOneToOne: false;
						referencedRelation: "prices";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "subscription_items_subscription_fkey";
						columns: ["subscription"];
						isOneToOne: false;
						referencedRelation: "subscriptions";
						referencedColumns: ["id"];
					},
				];
			};
			subscription_schedules: {
				Row: {
					application: string | null;
					canceled_at: number | null;
					completed_at: number | null;
					created: number;
					current_phase: Json | null;
					customer: string;
					default_settings: Json | null;
					end_behavior: string | null;
					id: string;
					livemode: boolean;
					metadata: Json;
					object: string | null;
					phases: Json;
					released_at: number | null;
					released_subscription: string | null;
					status: Database["stripe"]["Enums"]["subscription_schedule_status"];
					subscription: string | null;
					test_clock: string | null;
				};
				Insert: {
					application?: string | null;
					canceled_at?: number | null;
					completed_at?: number | null;
					created: number;
					current_phase?: Json | null;
					customer: string;
					default_settings?: Json | null;
					end_behavior?: string | null;
					id: string;
					livemode: boolean;
					metadata: Json;
					object?: string | null;
					phases: Json;
					released_at?: number | null;
					released_subscription?: string | null;
					status: Database["stripe"]["Enums"]["subscription_schedule_status"];
					subscription?: string | null;
					test_clock?: string | null;
				};
				Update: {
					application?: string | null;
					canceled_at?: number | null;
					completed_at?: number | null;
					created?: number;
					current_phase?: Json | null;
					customer?: string;
					default_settings?: Json | null;
					end_behavior?: string | null;
					id?: string;
					livemode?: boolean;
					metadata?: Json;
					object?: string | null;
					phases?: Json;
					released_at?: number | null;
					released_subscription?: string | null;
					status?: Database["stripe"]["Enums"]["subscription_schedule_status"];
					subscription?: string | null;
					test_clock?: string | null;
				};
				Relationships: [];
			};
			subscriptions: {
				Row: {
					application_fee_percent: number | null;
					billing_cycle_anchor: number | null;
					billing_thresholds: Json | null;
					cancel_at: number | null;
					cancel_at_period_end: boolean | null;
					canceled_at: number | null;
					collection_method: string | null;
					created: number | null;
					current_period_end: number | null;
					current_period_start: number | null;
					customer: string | null;
					days_until_due: number | null;
					default_payment_method: string | null;
					default_source: string | null;
					default_tax_rates: Json | null;
					discount: Json | null;
					ended_at: number | null;
					id: string;
					items: Json | null;
					latest_invoice: string | null;
					livemode: boolean | null;
					metadata: Json | null;
					next_pending_invoice_item_invoice: number | null;
					object: string | null;
					pause_collection: Json | null;
					pending_invoice_item_interval: Json | null;
					pending_setup_intent: string | null;
					pending_update: Json | null;
					plan: string | null;
					schedule: string | null;
					start_date: number | null;
					status: Database["stripe"]["Enums"]["subscription_status"] | null;
					transfer_data: Json | null;
					trial_end: Json | null;
					trial_start: Json | null;
					updated_at: string;
				};
				Insert: {
					application_fee_percent?: number | null;
					billing_cycle_anchor?: number | null;
					billing_thresholds?: Json | null;
					cancel_at?: number | null;
					cancel_at_period_end?: boolean | null;
					canceled_at?: number | null;
					collection_method?: string | null;
					created?: number | null;
					current_period_end?: number | null;
					current_period_start?: number | null;
					customer?: string | null;
					days_until_due?: number | null;
					default_payment_method?: string | null;
					default_source?: string | null;
					default_tax_rates?: Json | null;
					discount?: Json | null;
					ended_at?: number | null;
					id: string;
					items?: Json | null;
					latest_invoice?: string | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					next_pending_invoice_item_invoice?: number | null;
					object?: string | null;
					pause_collection?: Json | null;
					pending_invoice_item_interval?: Json | null;
					pending_setup_intent?: string | null;
					pending_update?: Json | null;
					plan?: string | null;
					schedule?: string | null;
					start_date?: number | null;
					status?: Database["stripe"]["Enums"]["subscription_status"] | null;
					transfer_data?: Json | null;
					trial_end?: Json | null;
					trial_start?: Json | null;
					updated_at?: string;
				};
				Update: {
					application_fee_percent?: number | null;
					billing_cycle_anchor?: number | null;
					billing_thresholds?: Json | null;
					cancel_at?: number | null;
					cancel_at_period_end?: boolean | null;
					canceled_at?: number | null;
					collection_method?: string | null;
					created?: number | null;
					current_period_end?: number | null;
					current_period_start?: number | null;
					customer?: string | null;
					days_until_due?: number | null;
					default_payment_method?: string | null;
					default_source?: string | null;
					default_tax_rates?: Json | null;
					discount?: Json | null;
					ended_at?: number | null;
					id?: string;
					items?: Json | null;
					latest_invoice?: string | null;
					livemode?: boolean | null;
					metadata?: Json | null;
					next_pending_invoice_item_invoice?: number | null;
					object?: string | null;
					pause_collection?: Json | null;
					pending_invoice_item_interval?: Json | null;
					pending_setup_intent?: string | null;
					pending_update?: Json | null;
					plan?: string | null;
					schedule?: string | null;
					start_date?: number | null;
					status?: Database["stripe"]["Enums"]["subscription_status"] | null;
					transfer_data?: Json | null;
					trial_end?: Json | null;
					trial_start?: Json | null;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "subscriptions_customer_fkey";
						columns: ["customer"];
						isOneToOne: false;
						referencedRelation: "customers";
						referencedColumns: ["id"];
					},
				];
			};
			tax_ids: {
				Row: {
					country: string | null;
					created: number;
					customer: string | null;
					id: string;
					livemode: boolean | null;
					object: string | null;
					owner: Json | null;
					type: string | null;
					value: string | null;
				};
				Insert: {
					country?: string | null;
					created: number;
					customer?: string | null;
					id: string;
					livemode?: boolean | null;
					object?: string | null;
					owner?: Json | null;
					type?: string | null;
					value?: string | null;
				};
				Update: {
					country?: string | null;
					created?: number;
					customer?: string | null;
					id?: string;
					livemode?: boolean | null;
					object?: string | null;
					owner?: Json | null;
					type?: string | null;
					value?: string | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			invoice_status:
				| "draft"
				| "open"
				| "paid"
				| "uncollectible"
				| "void"
				| "deleted";
			pricing_tiers: "graduated" | "volume";
			pricing_type: "one_time" | "recurring";
			subscription_schedule_status:
				| "not_started"
				| "active"
				| "completed"
				| "released"
				| "canceled";
			subscription_status:
				| "trialing"
				| "active"
				| "canceled"
				| "incomplete"
				| "incomplete_expired"
				| "past_due"
				| "unpaid";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	graphql_public: {
		Enums: {},
	},
	public: {
		Enums: {
			audit_action_enum: ["INSERT", "UPDATE", "DELETE"],
			call_type_enum: ["onboarding", "check_in", "monthly", "other"],
			payment_frequency_enum: ["monthly", "bi_weekly", "weekly", "one_time"],
			payment_status_enum: ["pending", "completed", "failed", "refunded"],
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
} as const;
