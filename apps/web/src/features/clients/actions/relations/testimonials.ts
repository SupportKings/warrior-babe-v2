"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

interface ClientTestimonial {
	id?: string;
	content: string;
	testimonial_type: string;
	testimonial_url: string;
	recorded_date: string;
}

export async function saveClientTestimonials(
	clientId: string,
	testimonials: ClientTestimonial[],
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get existing testimonials to compare
	const { data: existingTestimonials } = await supabase
		.from("client_testimonials")
		.select("id")
		.eq("client_id", clientId);

	const existingIds = existingTestimonials?.map((t) => t.id) || [];
	const currentIds = testimonials.filter((t) => t.id).map((t) => t.id);
	const toDelete = existingIds.filter((id) => !currentIds.includes(id));

	// Delete removed testimonials
	if (toDelete.length > 0) {
		await supabase.from("client_testimonials").delete().in("id", toDelete);
	}

	// Upsert testimonials
	for (const testimonial of testimonials) {
		if (testimonial.id) {
			// Update existing
			await supabase
				.from("client_testimonials")
				.update({
					content: testimonial.content,
					testimonial_type: testimonial.testimonial_type,
					testimonial_url: testimonial.testimonial_url || null,
					recorded_by: user.user.id,
					recorded_date: testimonial.recorded_date,
				})
				.eq("id", testimonial.id);
		} else {
			// Create new
			await supabase.from("client_testimonials").insert({
				client_id: clientId,
				content: testimonial.content,
				testimonial_type: testimonial.testimonial_type,
				testimonial_url: testimonial.testimonial_url || null,
				recorded_by: user.user.id,
				recorded_date: testimonial.recorded_date,
			});
		}
	}

	return { success: true };
}

export async function updateClientTestimonial(
	testimonialId: string,
	testimonialData: Partial<ClientTestimonial>,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("client_testimonials")
		.update({
			...testimonialData,
			recorded_by: user.user.id,
		})
		.eq("id", testimonialId);

	if (error) {
		throw new Error(`Failed to update testimonial: ${error.message}`);
	}

	return { success: true };
}

export async function deleteClientTestimonial(testimonialId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("client_testimonials")
		.delete()
		.eq("id", testimonialId);

	if (error) {
		throw new Error(`Failed to delete testimonial: ${error.message}`);
	}

	return { success: true };
}

export async function createClientTestimonial(
	clientId: string,
	testimonialData: Omit<ClientTestimonial, "id">,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_testimonials")
		.insert({
			client_id: clientId,
			...testimonialData,
			recorded_by: user.user.id,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create testimonial: ${error.message}`);
	}

	return { success: true, data };
}
