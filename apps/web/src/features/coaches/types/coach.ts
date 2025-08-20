import type { Tables } from "@/utils/supabase/database.types";

export type User = Tables<"user">;
export type CoachCapacity = Tables<"coach_capacity">;
export type ClientAssignment = Tables<"client_assignments">;
export type CoachTeam = Tables<"coach_teams">;
export type Client = Tables<"clients">;

export interface Coach extends User {
  capacity?: CoachCapacity;
  clientCount?: number;
  isPremier?: boolean;
  rating?: number;
  satisfactionScore?: number;
  lastActivity?: string;
}

export interface CoachMetrics {
  totalCoaches: number;
  premierCoachCount: number;
  regularCoachCount: number;
  averageRating: number;
  averageSatisfaction: number; // Average raw NPS score (0-10)
  npsScore: number; // Calculated NPS (-100 to +100)
  totalClients: number;
  sessionsThisWeek: number;
  npsResponseCount: number;
  npsDistribution: {
    detractors: number;
    passives: number;
    promoters: number;
  };
}

export interface CoachPerformance {
  coachId: string;
  coachName: string;
  coachImage?: string | null;
  coachType: "Premier" | "Regular";
  satisfactionPercentage: number; // Keep for backward compatibility
  npsScore: number; // Actual NPS score (-100 to +100)
  clientCount: number;
}

export interface CoachWorkload {
  coachId: string;
  coachName: string;
  coachImage?: string | null;
  clientCount: number;
  maxCapacity: number;
  utilizationPercentage: number;
}

export interface CoachTableRow {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  type: "Premier" | "Regular";
  specialization?: { name: string; icon: string | null } | string;
  certifications: Array<{
    id: string;
    name: string;
    icon?: string | null;
    verified?: boolean | null;
  }>;
  activeClients: number;
  rating: number;
  currentCapacity: number;
  maxCapacity: number;
  status: "Active" | "Paused" | "On Leave";
  lastActivity: string;
  satisfaction: number;
  premierCoach?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  // New metrics
  goalsHitRate: number; // Mock percentage of clients hitting goals
  openTickets: number; // Count of open tickets for coach's clients
  renewalRate: number; // Percentage of clients who renewed
  averageNPS: number; // Average NPS score from clients
  totalUnits: number; // Total client units under management
}

export interface CoachRenewalRate {
  coachId: string;
  coachName: string;
  coachImage?: string | null;
  renewalRate: number;
  clientCount: number;
}

export type CoachStatus = "Active" | "Paused" | "On Leave";
export type CoachType = "Premier" | "Regular";