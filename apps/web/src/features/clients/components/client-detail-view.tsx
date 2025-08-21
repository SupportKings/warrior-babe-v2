"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
	Mail,
	Phone,
	Calendar,
	User,
	ExternalLink,
	CheckCircle2,
	XCircle,
	Clock,
	Target
} from "lucide-react";

interface ClientDetailViewProps {
	client: {
		id: string;
		first_name: string;
		last_name: string;
		email: string;
		phone: string | null;
		start_date: string;
		end_date: string | null;
		renewal_date: string | null;
		status: string | null;
		platform_access_status: string | null;
		platform_link: string | null;
		consultation_form_completed: boolean | null;
		vip_terms_signed: boolean | null;
		onboarding_notes: string | null;
		churned_at: string | null;
		paused_at: string | null;
		offboard_date: string | null;
		created_at: string | null;
		updated_at: string | null;
		created_by?: {
			id: string;
			name: string;
			email: string;
		} | null;
		product?: {
			id: string;
			name: string;
			client_unit: number;
			description: string | null;
		} | null;
		client_assignments?: Array<{
			id: string;
			user_id: string;
			start_date: string;
			assignment_type: string;
			coach: {
				id: string;
				name: string;
				email: string;
			};
		}>;
		client_goals?: Array<{
			id: string;
			goal_type_id: string | null;
			description: string | null;
			status: string | null;
			created_at: string | null;
			goal_type: {
				id: string;
				name: string;
				description: string | null;
			} | null;
		}>;
	};
}

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

const getStatusColor = (status: string | null) => {
	switch (status?.toLowerCase()) {
		case "active":
			return "bg-green-500/10 text-green-700 border-green-500/20";
		case "paused":
			return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
		case "churned":
			return "bg-red-500/10 text-red-700 border-red-500/20";
		case "onboarding":
			return "bg-blue-500/10 text-blue-700 border-blue-500/20";
		case "pending":
			return "bg-gray-500/10 text-gray-700 border-gray-500/20";
		default:
			return "bg-gray-500/10 text-gray-700 border-gray-500/20";
	}
};

const getPlatformAccessColor = (status: string | null) => {
	switch (status?.toLowerCase()) {
		case "granted":
			return "bg-green-500/10 text-green-700 border-green-500/20";
		case "pending":
			return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
		case "revoked":
		case "expired":
			return "bg-red-500/10 text-red-700 border-red-500/20";
		default:
			return "bg-gray-500/10 text-gray-700 border-gray-500/20";
	}
};

export default function ClientDetailView({ client }: ClientDetailViewProps) {
	const fullName = `${client.first_name} ${client.last_name}`;
	const initials = `${client.first_name[0]}${client.last_name[0]}`.toUpperCase();

	return (
		<div className="space-y-6 p-6">
			{/* Header Section */}
			<div className="flex items-start justify-between">
				<div className="flex items-start space-x-4">
					<Avatar className="h-16 w-16">
						<AvatarFallback className="text-lg font-semibold">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="text-2xl font-bold">{fullName}</h1>
						<div className="flex items-center space-x-2 text-muted-foreground">
							<Mail className="h-4 w-4" />
							<span>{client.email}</span>
						</div>
						{client.phone && (
							<div className="flex items-center space-x-2 text-muted-foreground">
								<Phone className="h-4 w-4" />
								<span>{client.phone}</span>
							</div>
						)}
						<div className="flex items-center space-x-2 mt-2">
							<Badge className={getStatusColor(client.status)}>
								{client.status || "Unknown"}
							</Badge>
							<Badge className={getPlatformAccessColor(client.platform_access_status)}>
								Platform: {client.platform_access_status || "Unknown"}
							</Badge>
						</div>
					</div>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Basic Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium text-muted-foreground">Full Name</label>
							<p className="text-sm">{fullName}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-muted-foreground">Email</label>
							<p className="text-sm">{client.email}</p>
						</div>
						{client.phone && (
							<div>
								<label className="text-sm font-medium text-muted-foreground">Phone</label>
								<p className="text-sm">{client.phone}</p>
							</div>
						)}
						<div>
							<label className="text-sm font-medium text-muted-foreground">Status</label>
							<p className="text-sm">
								<Badge className={getStatusColor(client.status)}>
									{client.status || "Unknown"}
								</Badge>
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Dates */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Important Dates
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium text-muted-foreground">Start Date</label>
							<p className="text-sm">{formatDate(client.start_date)}</p>
						</div>
						{client.end_date && (
							<div>
								<label className="text-sm font-medium text-muted-foreground">End Date</label>
								<p className="text-sm">{formatDate(client.end_date)}</p>
							</div>
						)}
						{client.renewal_date && (
							<div>
								<label className="text-sm font-medium text-muted-foreground">Renewal Date</label>
								<p className="text-sm">{formatDate(client.renewal_date)}</p>
							</div>
						)}
						{client.churned_at && (
							<div>
								<label className="text-sm font-medium text-muted-foreground">Churned Date</label>
								<p className="text-sm">{formatDate(client.churned_at)}</p>
							</div>
						)}
						{client.paused_at && (
							<div>
								<label className="text-sm font-medium text-muted-foreground">Paused Date</label>
								<p className="text-sm">{formatDate(client.paused_at)}</p>
							</div>
						)}
						{client.offboard_date && (
							<div>
								<label className="text-sm font-medium text-muted-foreground">Offboard Date</label>
								<p className="text-sm">{formatDate(client.offboard_date)}</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Platform Access */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ExternalLink className="h-5 w-5" />
							Platform Access
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium text-muted-foreground">Access Status</label>
							<p className="text-sm">
								<Badge className={getPlatformAccessColor(client.platform_access_status)}>
									{client.platform_access_status || "Unknown"}
								</Badge>
							</p>
						</div>
						{client.platform_link && (
							<div>
								<label className="text-sm font-medium text-muted-foreground">Platform Link</label>
								<p className="text-sm">
									<a 
										href={client.platform_link} 
										target="_blank" 
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 underline"
									>
										{client.platform_link}
									</a>
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Onboarding Status */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircle2 className="h-5 w-5" />
							Onboarding Status
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<label className="text-sm font-medium text-muted-foreground">Consultation Form</label>
							<div className="flex items-center space-x-2">
								{client.consultation_form_completed ? (
									<CheckCircle2 className="h-4 w-4 text-green-600" />
								) : (
									<XCircle className="h-4 w-4 text-red-600" />
								)}
								<span className="text-sm">
									{client.consultation_form_completed ? "Completed" : "Not Completed"}
								</span>
							</div>
						</div>
						<div className="flex items-center justify-between">
							<label className="text-sm font-medium text-muted-foreground">VIP Terms</label>
							<div className="flex items-center space-x-2">
								{client.vip_terms_signed ? (
									<CheckCircle2 className="h-4 w-4 text-green-600" />
								) : (
									<XCircle className="h-4 w-4 text-red-600" />
								)}
								<span className="text-sm">
									{client.vip_terms_signed ? "Signed" : "Not Signed"}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Assigned Coaches */}
			{client.client_assignments && client.client_assignments.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Assigned Coaches
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{client.client_assignments.map((assignment) => (
								<div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
									<div>
										<p className="font-medium">{assignment.coach.name}</p>
										<p className="text-sm text-muted-foreground">{assignment.coach.email}</p>
									</div>
									<div className="text-right">
										<p className="text-sm text-muted-foreground">
											{assignment.assignment_type} - Started {formatDate(assignment.start_date)}
										</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Client Goals */}
			{client.client_goals && client.client_goals.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Target className="h-5 w-5" />
							Goals
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{client.client_goals.map((goal) => (
								<div key={goal.id} className="p-3 border rounded-lg">
									<div className="flex items-center justify-between mb-2">
										<h4 className="font-medium">{goal.goal_type?.name || "Unknown Goal Type"}</h4>
										{goal.status && (
											<Badge className={getStatusColor(goal.status)}>
												{goal.status}
											</Badge>
										)}
									</div>
									{goal.description && (
										<p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
									)}
									{goal.goal_type?.description && (
										<p className="text-xs text-muted-foreground">{goal.goal_type.description}</p>
									)}
									<p className="text-xs text-muted-foreground mt-2">
										Created {formatDate(goal.created_at)}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Onboarding Notes */}
			{client.onboarding_notes && (
				<Card>
					<CardHeader>
						<CardTitle>Onboarding Notes</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm whitespace-pre-wrap">{client.onboarding_notes}</p>
					</CardContent>
				</Card>
			)}

			{/* Product Information */}
			{client.product && (
				<Card>
					<CardHeader>
						<CardTitle>Product Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<label className="text-sm font-medium text-muted-foreground">Product</label>
							<p className="text-sm">{client.product.name}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-muted-foreground">Client Units</label>
							<p className="text-sm">{client.product.client_unit}</p>
						</div>
						{client.product.description && (
							<div>
								<label className="text-sm font-medium text-muted-foreground">Description</label>
								<p className="text-sm">{client.product.description}</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* System Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						System Information
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{client.created_by && (
						<div>
							<label className="text-sm font-medium text-muted-foreground">Created By</label>
							<p className="text-sm">{client.created_by.name} ({client.created_by.email})</p>
						</div>
					)}
					<div>
						<label className="text-sm font-medium text-muted-foreground">Created At</label>
						<p className="text-sm">{formatDate(client.created_at)}</p>
					</div>
					{client.updated_at && (
						<div>
							<label className="text-sm font-medium text-muted-foreground">Last Updated</label>
							<p className="text-sm">{formatDate(client.updated_at)}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}