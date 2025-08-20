"use server";

import { createClient } from "@/utils/supabase/server";
import { differenceInDays, startOfWeek, endOfWeek } from "date-fns";

export async function getOnboardingOverview() {
	const supabase = await createClient();

	// Get all clients with onboarding status
	const { data: clients, error: clientsError } = await supabase
		.from("clients")
		.select(`
			*,
			client_onboarding_progress (
				*,
				checklist_items (*)
			)
		`)
		.eq("status", "onboarding")
		.order("start_date", { ascending: false });

	if (clientsError) throw clientsError;

	// Get the onboarding template to know total tasks
	const { data: template } = await supabase
		.from("checklist_templates")
		.select(`
			*,
			checklist_items (*)
		`)
		.eq("type", "client_cs_onboarding")
		.eq("is_active", true)
		.single();

	const totalTasks = template?.checklist_items?.length ?? 0;

	// Transform data for the overview
	const overview = clients?.map(client => {
		const progress = client.client_onboarding_progress ?? [];
		const completedTasks = progress.filter((p: any) => p.is_completed).length;
		const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
		const daysInOnboarding = differenceInDays(new Date(), new Date(client.start_date));

		// Map progress items with their checklist details
		const progressItems = progress.map((p: any) => ({
			id: p.id,
			checklistItemId: p.checklist_item_id,
			isCompleted: p.is_completed,
			completedAt: p.completed_at,
			notes: p.notes,
			checklistItem: p.checklist_items || template?.checklist_items?.find((item: any) => item.id === p.checklist_item_id) || {
				id: p.checklist_item_id,
				title: "Unknown Task",
				description: null,
				isRequired: false,
				sortOrder: 0,
				template_id: template?.id || null
			}
		})).sort((a: any, b: any) => a.checklistItem.sortOrder - b.checklistItem.sortOrder);

		return {
			id: client.id,
			firstName: client.first_name,
			lastName: client.last_name,
			email: client.email,
			startDate: client.start_date,
			status: client.status,
			progress: progressPercentage,
			completedTasks,
			totalTasks,
			daysInOnboarding: Math.max(1, daysInOnboarding),
			progressItems,
		};
	}) ?? [];

	return overview;
}

export async function getOnboardingMetrics() {
	const supabase = await createClient();
	const now = new Date();
	const weekStart = startOfWeek(now);
	const weekEnd = endOfWeek(now);

	// Get all clients in onboarding status
	const { data: activeClients } = await supabase
		.from("clients")
		.select("id, start_date, client_onboarding_progress(*)")
		.eq("status", "onboarding");

	// Get template to know total tasks
	const { data: template } = await supabase
		.from("checklist_templates")
		.select("*, checklist_items(*)")
		.eq("type", "client_cs_onboarding")
		.eq("is_active", true)
		.single();

	const totalTasks = template?.checklist_items?.length ?? 0;

	// Calculate metrics
	let activeOnboardings = 0;
	let completedThisWeek = 0;
	let totalProgress = 0;
	let pendingStart = 0;

	activeClients?.forEach(client => {
		const progress = client.client_onboarding_progress ?? [];
		const completedTasks = progress.filter((p: any) => p.is_completed).length;
		const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

		if (progressPercentage < 100) {
			activeOnboardings++;
			totalProgress += progressPercentage;
		}

		// Check if completed this week
		const completedItems = progress.filter((p: any) => 
			p.is_completed && 
			p.completed_at &&
			new Date(p.completed_at) >= weekStart &&
			new Date(p.completed_at) <= weekEnd
		);

		if (completedItems.length === totalTasks) {
			completedThisWeek++;
		}

		// Check if pending start (no progress)
		if (progress.length === 0) {
			pendingStart++;
		}
	});

	const averageProgress = activeOnboardings > 0 
		? Math.round(totalProgress / activeOnboardings)
		: 0;

	return {
		activeOnboardings,
		completedThisWeek,
		averageProgress,
		pendingStart,
	};
}

export async function getOnboardingTemplate() {
	const supabase = await createClient();

	const { data: template, error } = await supabase
		.from("checklist_templates")
		.select(`
			*,
			checklist_items (
				id,
				title,
				description,
				is_required,
				sort_order
			)
		`)
		.eq("type", "client_cs_onboarding")
		.eq("is_active", true)
		.single();

	if (error && error.code !== "PGRST116") throw error;

	return {
		...template,
		items: template?.checklist_items?.sort((a: any, b: any) => a.sort_order - b.sort_order) ?? [],
	};
}

export async function getAllTemplates() {
	const supabase = await createClient();

	const { data: templates, error } = await supabase
		.from("checklist_templates")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw error;

	return templates ?? [];
}