"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CoachAssignmentsTable } from "./coach-assignments-table";
import { CoachPaymentsTable } from "./coach-payments-table";

type ClientAssignment = {
	id: string;
	assignment_type: string;
	start_date: string;
	end_date: string | null;
	client: {
		id: string;
		name: string;
		email: string;
	} | null;
};

type CoachPayment = {
	id: string;
	date: string;
	total_clients: number;
	total_active_clients: number;
	status: string;
};

interface CoachActivitiesTabsProps {
	assignments: ClientAssignment[];
	payments: CoachPayment[];
	coachId: string;
}

export function CoachActivitiesTabs({
	assignments,
	payments,
	coachId,
}: CoachActivitiesTabsProps) {
	return (
		<Tabs defaultValue="assignments" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="assignments">
					Client Assignments ({assignments?.length || 0})
				</TabsTrigger>
				<TabsTrigger value="payments">
					Payments ({payments?.length || 0})
				</TabsTrigger>
			</TabsList>
			<TabsContent value="assignments">
				<CoachAssignmentsTable assignments={assignments} />
			</TabsContent>
			<TabsContent value="payments">
				<CoachPaymentsTable payments={payments} coachId={coachId} />
			</TabsContent>
		</Tabs>
	);
}
