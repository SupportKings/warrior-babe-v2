"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ClientForm from "./client-form";
import { useClientBasic } from "@/features/clients/queries/useClients";

interface ClientEditContentProps {
	clientId: string;
}

export default function ClientEditContent({ clientId }: ClientEditContentProps) {
	const { data: client, error } = useClientBasic(clientId);

	if (error || !client) {
		return (
			<div className="text-center py-12">
				<h2 className="text-2xl font-semibold text-gray-900">Client not found</h2>
				<p className="mt-2 text-gray-600">
					The client you're trying to edit doesn't exist or has been removed.
				</p>
				<Button asChild className="mt-4">
					<Link href="/dashboard/clients">
						Back to Clients
					</Link>
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
		status: client.status || "active",
		platform_access_status: client.platform_access_status || "pending",
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
			<ClientForm
				mode="edit"
				initialData={formData}
			/>
		</div>
	);
}

