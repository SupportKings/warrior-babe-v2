"use server";

import type { Database } from "@/utils/supabase/database.types";
import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"];

export type TicketWithRelations = Ticket & {
	created_by_user?: {
		id: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
	} | null;
	assigned_to_user?: {
		id: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
	} | null;
	client?: {
		id: string;
		first_name?: string | null;
		last_name?: string | null;
		email?: string | null;
	} | null;
};

export const getTicket = async (
	ticketId: string,
): Promise<TicketWithRelations | null> => {
	// Get current user session
	const session = await getUser();

	if (!session?.user) {
		throw new Error("Unauthorized");
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("tickets")
		.select(`
      *,
      created_by_user:user!tickets_created_by_fkey(
        id,
        name,
        email,
        image
      ),
      assigned_to_user:user!tickets_assigned_to_fkey(
        id,
        name,
        email,
        image
      ),
      client:clients(
        id,
        first_name,
        last_name,
        email
      )
    `)
		.eq("id", ticketId)
		.single();

	if (error) {
		console.error("Error fetching ticket:", error);
		return null;
	}

	return data as TicketWithRelations;
};
