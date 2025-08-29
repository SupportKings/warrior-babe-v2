"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { useClient } from "@/features/clients/queries/useClients";

import ClientForm from "./client-form";

interface ClientEditContentProps {
	clientId: string;
}

export default function ClientEditContent({
	clientId,
}: ClientEditContentProps) {
	const { data: client, error } = useClient(clientId);

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
	const formData: any = {
		id: client.id,
		name: client.name,
		email: client.email,
		phone: client.phone || "",
		overall_status: client.overall_status || "new",
		everfit_access: client.everfit_access || "new",
		team_ids: client.team_ids || "",
		onboarding_call_completed: client.onboarding_call_completed || false,
		two_week_check_in_call_completed:
			client.two_week_check_in_call_completed || false,
		vip_terms_signed: client.vip_terms_signed || false,
		onboarding_notes: client.onboarding_notes || "",
		onboarding_completed_date: client.onboarding_completed_date || "",
		offboard_date: client.offboard_date || "",
		// Relations data
		client_assignments: client.client_assignments || [],
		client_goals: client.client_goals || [],
		client_wins: client.client_wins || [],
		client_activity_period: Array.isArray(client.client_activity_period) ? client.client_activity_period : [],
		client_nps: client.client_nps || [],
		client_testimonials: client.client_testimonials || [],
		payment_plans: client.payment_plans || [],
	};

	return (
		<div className="p-6">
			<ClientForm mode="edit" initialData={formData} />
		</div>
	);
}
