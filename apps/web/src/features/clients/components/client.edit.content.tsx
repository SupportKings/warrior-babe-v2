"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { useClientBasic } from "@/features/clients/queries/useClients";

import ClientForm from "./client-form";

interface ClientEditContentProps {
	clientId: string;
}

export default function ClientEditContent({
	clientId,
}: ClientEditContentProps) {
	const { data: client, error } = useClientBasic(clientId);

	if (error || !client) {
		return (
			<div className="py-12 text-center">
				<h2 className="font-semibold text-2xl text-gray-900">
					Client not found
				</h2>
				<p className="mt-2 text-gray-600">
					The client you're trying to edit doesn't exist or has been removed.
				</p>
				<Button asChild className="mt-4">
					<Link href="/dashboard/clients">Back to Clients</Link>
				</Button>
			</div>
		);
	}

	// Transform the client data for the form
	const formData = {
		id: client.id,
		first_name: client.first_name,
		last_name: client.last_name,
		email: client.email,
		phone: client.phone || "",
		start_date: client.start_date,
		end_date: client.end_date || "",
		renewal_date: client.renewal_date || "",
		product_id: client.product_id || "",
		status: (client.status || "active") as "active" | "paused" | "churned" | "onboarding" | "pending",
		platform_access_status: (client.platform_access_status || "pending") as "pending" | "granted" | "revoked" | "expired",
		platform_link: client.platform_link || "",
		consultation_form_completed: client.consultation_form_completed || false,
		vip_terms_signed: client.vip_terms_signed || false,
		onboarding_notes: client.onboarding_notes || "",
		churned_at: client.churned_at || "",
		paused_at: client.paused_at || "",
		offboard_date: client.offboard_date || "",
	};

	return (
		<div className="p-6">
			<ClientForm mode="edit" initialData={formData} />
		</div>
	);
}
