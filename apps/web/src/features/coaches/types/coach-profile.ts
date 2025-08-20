import type { Tables } from "@/utils/supabase/database.types";
import type { Coach, Client } from "./coach";

// Extended coach profile with all relations
export interface CoachProfile extends Coach {
  coach_capacity?: Tables<"coach_capacity">;
  team_members?: CoachTeamMember[];
  premier_coach?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  current_clients?: CoachClient[];
  performance_history?: CoachPerformanceData[];
  certifications?: CoachCertification[];
  total_clients_served?: number;
  average_client_duration?: number;
  success_rate?: number;
  rating?: number;
  npsScore?: number;
  totalUnits?: number;
  globalDefaultClientUnits?: number;
}

// Team member for premier coaches
export interface CoachTeamMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  client_count: number;
  capacity_percentage: number;
  joined_team_date: string;
}

// Client data specific to coach view
export interface CoachClient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  start_date: string;
  status: string | null;
  last_activity_date?: string;
  progress_percentage?: number;
  nps_score?: number;
  total_sessions?: number;
  next_session_date?: string;
  product_name?: string;
}

// Time series performance data
export interface CoachPerformanceData {
  date: string;
  rating: number;
  client_count: number;
  session_count: number;
  nps_average: number;
  completion_rate: number;
}

// Certification type (mocked for now)
export interface CoachCertification {
  id: string;
  name: string;
  issuer: string;
  date_achieved: string;
  expiry_date?: string;
  badge_color?: string;
  icon?: string;
}

// Performance metrics for display
export interface CoachMetricCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
}

// Chart data format
export interface PerformanceChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

// MOCK DATA: Mock certification data - Replace with real data from database
export const MOCK_CERTIFICATIONS: CoachCertification[] = [
  {
    id: "1",
    name: "Certified Health Coach",
    issuer: "National Board for Health & Wellness Coaching",
    date_achieved: "2023-03-15",
    badge_color: "blue",
  },
  {
    id: "2",
    name: "Nutrition Specialist",
    issuer: "American Council on Exercise",
    date_achieved: "2022-11-20",
    badge_color: "green",
  },
  {
    id: "3",
    name: "Mental Performance Consultant",
    issuer: "Association for Applied Sport Psychology",
    date_achieved: "2023-08-10",
    badge_color: "purple",
  },
];