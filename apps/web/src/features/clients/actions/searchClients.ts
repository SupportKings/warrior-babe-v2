"use server";

import { createClient } from "@/utils/supabase/server";

export async function searchClientEmails(searchTerm: string, limit = 50) {
	if (!searchTerm.trim()) {
		return [];
	}

	try {
		const supabase = await createClient();

		// First search by client_emails.email
		const { data: emailResults, error: emailError } = await supabase
			.from("client_emails")
			.select(`
				id,
				email,
				client_id,
				clients!inner (
					id,
					name,
					email,
					is_deleted
				)
			`)
			.ilike("email", `%${searchTerm}%`)
			.eq("clients.is_deleted", false)
			.limit(limit);

		if (emailError) {
			console.error("Error searching by email:", emailError);
		}

		// Then search by client name
		const { data: nameResults, error: nameError } = await supabase
			.from("client_emails")
			.select(`
				id,
				email,
				client_id,
				clients!inner (
					id,
					name,
					email,
					is_deleted
				)
			`)
			.ilike("clients.name", `%${searchTerm}%`)
			.eq("clients.is_deleted", false)
			.limit(limit);

		if (nameError) {
			console.error("Error searching by name:", nameError);
		}

		// Also search by client primary email
		const { data: primaryEmailResults, error: primaryEmailError } = await supabase
			.from("client_emails")
			.select(`
				id,
				email,
				client_id,
				clients!inner (
					id,
					name,
					email,
					is_deleted
				)
			`)
			.ilike("clients.email", `%${searchTerm}%`)
			.eq("clients.is_deleted", false)
			.limit(limit);

		if (primaryEmailError) {
			console.error("Error searching by primary email:", primaryEmailError);
		}

		// Combine and deduplicate results from all three searches
		const allResults = [
			...(emailResults || []), 
			...(nameResults || []), 
			...(primaryEmailResults || [])
		];
		const uniqueResults = allResults.reduce((acc, clientEmail) => {
			if (!acc.some(existing => existing.id === clientEmail.id)) {
				acc.push(clientEmail);
			}
			return acc;
		}, [] as typeof allResults);

		// Transform the data for the combobox
		// Return client_emails.id as the value (what we'll store in payments.client_email)
		// Display the email and client name for selection
		const transformedResults = uniqueResults.slice(0, limit).map((clientEmail) => ({
			id: clientEmail.id, // client_emails.id - this is what we store in payments.client_email
			email: clientEmail.email, // The email to display
			clientId: clientEmail.clients.id,
			clientName: clientEmail.clients.name,
			clientPrimaryEmail: clientEmail.clients.email,
		}));

		return transformedResults;
	} catch (error) {
		console.error("Unexpected error in searchClientEmails:", error);
		return [];
	}
}