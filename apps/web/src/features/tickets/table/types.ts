import type { Database } from "@/utils/supabase/database.types";

export type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  created_by_user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  assigned_to_user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  client?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
};

export type TicketStatus = {
  id: 'open' | 'in_progress' | 'resolved' | 'closed' | 'paused';
  name: string;
  color: string;
};

export type TicketPriority = {
  id: 'low' | 'medium' | 'high' | 'urgent';
  name: string;
  color: string;
};

export type TicketType = {
  id: 'billing' | 'tech_problem' | 'escalation' | 'coaching_transfer' | 'retention' | 'pausing' | 'other';
  name: string;
};

export const ticketStatuses: TicketStatus[] = [
  { id: 'open', name: 'Open', color: '#22c55e' },
  { id: 'in_progress', name: 'In Progress', color: '#facc15' },
  { id: 'resolved', name: 'Resolved', color: '#3b82f6' },
  { id: 'closed', name: 'Closed', color: '#6b7280' },
  { id: 'paused', name: 'Paused', color: '#8b5cf6' },
];

export const ticketPriorities: TicketPriority[] = [
  { id: 'low', name: 'Low', color: '#3b82f6' },
  { id: 'medium', name: 'Medium', color: '#facc15' },
  { id: 'high', name: 'High', color: '#f97316' },
  { id: 'urgent', name: 'Urgent', color: '#ef4444' },
];

export const ticketTypes: TicketType[] = [
  { id: 'billing', name: 'Billing' },
  { id: 'tech_problem', name: 'Technical Problem' },
  { id: 'escalation', name: 'Escalation' },
  { id: 'coaching_transfer', name: 'Coaching Transfer' },
  { id: 'retention', name: 'Retention' },
  { id: 'pausing', name: 'Pausing' },
  { id: 'other', name: 'Other' },
];