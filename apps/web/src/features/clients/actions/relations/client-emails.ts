"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

interface ClientEmail {
	id?: number;
	email: string;
}

export async function updateClientEmail(
	emailId: number,
	emailData: Partial<ClientEmail>,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Clean and validate email data
	const cleanedEmail = emailData.email?.toLowerCase().trim();

	const { error } = await supabase
		.from("client_emails")
		.update({
			email: cleanedEmail,
		})
		.eq("id", emailId);

	if (error) {
		throw new Error(`Failed to update email: ${error.message}`);
	}

	return { success: true };
}

export async function deleteClientEmail(emailId: number) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase.from("client_emails").delete().eq("id", emailId);

	if (error) {
		throw new Error(`Failed to delete email: ${error.message}`);
	}

	return { success: true };
}

export async function createClientEmail(
	clientId: string,
	emailData: Omit<ClientEmail, "id">,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Clean and validate email data
	const cleanedEmail = emailData.email.toLowerCase().trim();

	const { data, error } = await supabase
		.from("client_emails")
		.insert({
			client_id: clientId,
			email: cleanedEmail,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create email: ${error.message}`);
	}

	return { success: true, data };
}