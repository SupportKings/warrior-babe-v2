"use server";

import { createClient } from "@/utils/supabase/server";

export async function getClientTestimonial(id: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("client_testimonials")
		.select(`
			*,
			client:clients (
				id,
				name,
				email,
				phone
			),
			recorded_by_user:user!client_testimonials_recorded_by_user_id_fk (
				id,
				name,
				email
			)
		`)
		.eq("id", id)
		.single();

	if (error || !data) {
		throw new Error("Testimonial not found");
	}

	// Transform the data to match the expected format
	return {
		...data,
		client_name: data.client?.name || "Unknown Client",
		client_email: data.client?.email || "",
		recorded_by_name: data.recorded_by_user?.name || "Unknown",
		recorded_by_email: data.recorded_by_user?.email || "",
	};
}
