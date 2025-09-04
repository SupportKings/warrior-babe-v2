"use server";

import { createClient } from "@/utils/supabase/server";

export async function getClientTestimonial(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_testimonials")
    .select(
      `
			*,
			client:clients (
				id,
				name,
				email,
				phone
			)
		`
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error("Testimonial not found");
  }

  let team_member = null;
  if (data.recorded_by) {
    const { data: memberData, error: team_member_error } = await supabase
      .from("team_members")
      .select(`name, user_id`)
      .eq("user_id", data.recorded_by)
      .limit(1);

    team_member = memberData?.[0] || null;
  }

  return {
    ...data,
    client_name: data.client?.name || "Unknown Client",
    client_email: data.client?.email || "",
    recorded_by_name: team_member?.name || "Unknown",
  };
}
