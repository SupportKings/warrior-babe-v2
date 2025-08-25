"use client";

import { useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import { useQueryClient } from "@tanstack/react-query";
import {
	createColumnHelper,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
	Calendar,
	CheckCircle2,
	Clock,
	CreditCard,
	Edit, MessageSquare, Star,
	Target,
	Trash2,
	User,
	XCircle
} from "lucide-react";
import { toast } from "sonner";
import {
	deleteClientActivityPeriod,
	deleteClientAssignment,
	deleteClientGoal,
	deleteClientNPSScore,
	deleteClientPaymentPlan,
	deleteClientTestimonial,
	deleteClientWin,
} from "../actions/deleteClientRelations";
import { clientQueries, useClient } from "../queries/useClients";
import { NoActivityPeriods } from "./empty-states/no-activity-periods";
import { NoAssignments } from "./empty-states/no-assignments";
import { NoGoals } from "./empty-states/no-goals";
import { NoNPS } from "./empty-states/no-nps";
import { NoPaymentPlans } from "./empty-states/no-payment-plans";
import { NoTestimonials } from "./empty-states/no-testimonials";
import { NoWins } from "./empty-states/no-wins";
import { ManageActivityPeriodModal } from "./manage-activity-period-modal";
import { ManageAssignmentModal } from "./manage-assignment-modal";
import { ManageGoalModal } from "./manage-goal-modal";
import { ManageNPSModal } from "./manage-nps-modal";
import { ManagePaymentPlanModal } from "./manage-payment-plan-modal";
import { ManageTestimonialModal } from "./manage-testimonial-modal";
import { ManageWinModal } from "./manage-win-modal";

interface ClientDetailViewProps {
	clientId: string;
}

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

// Column definitions for child tables
const createAssignmentColumns = (clientId: string, setDeleteModal: any) => {
	const assignmentColumnHelper = createColumnHelper<any>();
	return [
	assignmentColumnHelper.accessor("coach.name", {
		header: "Coach",
		cell: (info) =>
			info.getValue() || info.row.original.coach?.name || "Unknown",
	}),
	assignmentColumnHelper.accessor("coach.user.email", {
		header: "Email",
		cell: (info) => info.getValue() || "No email",
	}),
	assignmentColumnHelper.accessor("assignment_type", {
		header: "Type",
	}),
	assignmentColumnHelper.accessor("start_date", {
		header: "Start Date",
		cell: (info) => formatDate(info.getValue()),
	}),
	assignmentColumnHelper.accessor("end_date", {
		header: "End Date",
		cell: (info) => formatDate(info.getValue()),
	}),
	assignmentColumnHelper.display({
		id: "actions",
		header: "Actions",
		cell: (info) => (
			<div className="flex gap-2">
				<ManageAssignmentModal 
					clientId={clientId} 
					assignment={info.row.original}
					mode="edit"
				>
					<Button variant="ghost" size="sm">
						<Edit className="h-4 w-4" />
					</Button>
				</ManageAssignmentModal>
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						setDeleteModal({
							isOpen: true,
							type: "assignment",
							id: info.row.original.id,
							title: `Delete assignment for ${info.row.original.coach?.name || "Unknown"}`,
						})
					}
				>
					<Trash2 className="h-4 w-4 text-red-600" />
				</Button>
			</div>
		),
	}),
	];
};

const createGoalColumns = (clientId: string, setDeleteModal: any) => {
	const goalColumnHelper = createColumnHelper<any>();
	return [
	goalColumnHelper.accessor("title", {
		header: "Title",
	}),
	goalColumnHelper.accessor("description", {
		header: "Description",
	}),
	goalColumnHelper.accessor("status", {
		header: "Status",
		cell: (info) =>
			info.getValue() ? <StatusBadge>{info.getValue()}</StatusBadge> : null,
	}),
	goalColumnHelper.accessor("priority", {
		header: "Priority",
		cell: (info) =>
			info.getValue() ? <StatusBadge>{info.getValue()}</StatusBadge> : null,
	}),
	goalColumnHelper.accessor("target_value", {
		header: "Target",
	}),
	goalColumnHelper.accessor("current_value", {
		header: "Current",
	}),
	goalColumnHelper.accessor("due_date", {
		header: "Due Date",
		cell: (info) => formatDate(info.getValue()),
	}),
	goalColumnHelper.display({
		id: "actions",
		header: "Actions",
		cell: (info) => (
			<div className="flex gap-2">
				<ManageGoalModal 
					clientId={clientId} 
					goal={info.row.original}
					mode="edit"
				>
					<Button variant="ghost" size="sm">
						<Edit className="h-4 w-4" />
					</Button>
				</ManageGoalModal>
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						setDeleteModal({
							isOpen: true,
							type: "goal",
							id: info.row.original.id,
							title: `Delete goal "${info.row.original.title}"`,
						})
					}
				>
					<Trash2 className="h-4 w-4 text-red-600" />
				</Button>
			</div>
		),
	}),
	];
};

const createWinColumns = (clientId: string, setDeleteModal: any) => {
	const winColumnHelper = createColumnHelper<any>();
	return [
	winColumnHelper.accessor("title", {
		header: "Title",
	}),
	winColumnHelper.accessor("description", {
		header: "Description",
	}),
	winColumnHelper.accessor("win_date", {
		header: "Win Date",
		cell: (info) => formatDate(info.getValue()),
	}),
	winColumnHelper.accessor("recorded_by_user.name", {
		header: "Recorded By",
		cell: (info) => info.getValue() || "Unknown User",
	}),
	winColumnHelper.display({
		id: "actions",
		header: "Actions",
		cell: (info) => (
			<div className="flex gap-2">
				<ManageWinModal 
					clientId={clientId} 
					win={info.row.original}
					mode="edit"
				>
					<Button variant="ghost" size="sm">
						<Edit className="h-4 w-4" />
					</Button>
				</ManageWinModal>
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						setDeleteModal({
							isOpen: true,
							type: "win",
							id: info.row.original.id,
							title: `Delete win "${info.row.original.title}"`,
						})
					}
				>
					<Trash2 className="h-4 w-4 text-red-600" />
				</Button>
			</div>
		),
	}),
	];
};

const createActivityPeriodColumns = (clientId: string, setDeleteModal: any) => {
	const activityPeriodColumnHelper = createColumnHelper<any>();
	return [
	activityPeriodColumnHelper.accessor("active", {
		header: "Active",
		cell: (info) => (
			<StatusBadge>{info.getValue() ? "Active" : "Inactive"}</StatusBadge>
		),
	}),
	activityPeriodColumnHelper.accessor("start_date", {
		header: "Start Date",
		cell: (info) => formatDate(info.getValue()),
	}),
	activityPeriodColumnHelper.accessor("end_date", {
		header: "End Date",
		cell: (info) => formatDate(info.getValue()),
	}),
	activityPeriodColumnHelper.accessor("coach.name", {
		header: "Coach",
		cell: (info) =>
			info.getValue() ||
			info.row.original.coach?.name ||
			(info.row.original.coach_id
				? `Coach #${info.row.original.coach_id}`
				: "No coach assigned"),
	}),
	activityPeriodColumnHelper.display({
		id: "actions",
		header: "Actions",
		cell: (info) => (
			<div className="flex gap-2">
				<ManageActivityPeriodModal 
					clientId={clientId} 
					activityPeriod={info.row.original}
					mode="edit"
				>
					<Button variant="ghost" size="sm">
						<Edit className="h-4 w-4" />
					</Button>
				</ManageActivityPeriodModal>
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						setDeleteModal({
							isOpen: true,
							type: "activity_period",
							id: info.row.original.id,
							title: "Delete activity period",
						})
					}
				>
					<Trash2 className="h-4 w-4 text-red-600" />
				</Button>
			</div>
		),
	}),
	];
};

const createNPSColumns = (clientId: string, setDeleteModal: any) => {
	const npsColumnHelper = createColumnHelper<any>();
	return [
	npsColumnHelper.accessor("nps_score", {
		header: "NPS Score",
		cell: (info) => (
			<span
				className={`font-medium ${
					info.getValue() >= 9
						? "text-green-600"
						: info.getValue() >= 7
							? "text-yellow-600"
							: "text-red-600"
				}`}
			>
				{info.getValue()}
			</span>
		),
	}),
	npsColumnHelper.accessor("notes", {
		header: "Notes",
	}),
	npsColumnHelper.accessor("recorded_date", {
		header: "Recorded Date",
		cell: (info) => formatDate(info.getValue()),
	}),
	npsColumnHelper.display({
		id: "actions",
		header: "Actions",
		cell: (info) => (
			<div className="flex gap-2">
				<ManageNPSModal 
					clientId={clientId} 
					npsScore={info.row.original}
					mode="edit"
				>
					<Button variant="ghost" size="sm">
						<Edit className="h-4 w-4" />
					</Button>
				</ManageNPSModal>
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						setDeleteModal({
							isOpen: true,
							type: "nps",
							id: info.row.original.id,
							title: `Delete NPS score (${info.row.original.nps_score})`,
						})
					}
				>
					<Trash2 className="h-4 w-4 text-red-600" />
				</Button>
			</div>
		),
	}),
	];
};

const createTestimonialColumns = (clientId: string, setDeleteModal: any) => {
	const testimonialColumnHelper = createColumnHelper<any>();
	return [
	testimonialColumnHelper.accessor("content", {
		header: "Content",
		cell: (info) => (
			<div className="max-w-xs truncate" title={info.getValue()}>
				{info.getValue()}
			</div>
		),
	}),
	testimonialColumnHelper.accessor("testimonial_type", {
		header: "Type",
		cell: (info) => <StatusBadge>{info.getValue()}</StatusBadge>,
	}),
	testimonialColumnHelper.accessor("testimonial_url", {
		header: "URL",
		cell: (info) =>
			info.getValue() ? (
				<a
					href={info.getValue()}
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-600 hover:underline"
				>
					View
				</a>
			) : null,
	}),
	testimonialColumnHelper.accessor("recorded_date", {
		header: "Recorded Date",
		cell: (info) => formatDate(info.getValue()),
	}),
	testimonialColumnHelper.display({
		id: "actions",
		header: "Actions",
		cell: (info) => (
			<div className="flex gap-2">
				<ManageTestimonialModal 
					clientId={clientId} 
					testimonial={info.row.original}
					mode="edit"
				>
					<Button variant="ghost" size="sm">
						<Edit className="h-4 w-4" />
					</Button>
				</ManageTestimonialModal>
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						setDeleteModal({
							isOpen: true,
							type: "testimonial",
							id: info.row.original.id,
							title: "Delete testimonial",
						})
					}
				>
					<Trash2 className="h-4 w-4 text-red-600" />
				</Button>
			</div>
		),
	}),
	];
};

const createPaymentPlanColumns = (clientId: string, setDeleteModal: any) => {
	const paymentPlanColumnHelper = createColumnHelper<any>();
	return [
	paymentPlanColumnHelper.accessor("name", {
		header: "Plan Name",
	}),
	paymentPlanColumnHelper.accessor("type", {
		header: "Type",
		cell: (info) => <StatusBadge>{info.getValue()}</StatusBadge>,
	}),
	paymentPlanColumnHelper.accessor("platform", {
		header: "Platform",
	}),
	paymentPlanColumnHelper.accessor("total_amount", {
		header: "Total Amount",
		cell: (info) =>
			info.getValue()
				? `$${info.getValue().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
				: "Not set",
	}),
	paymentPlanColumnHelper.accessor("total_amount_paid", {
		header: "Amount Paid",
		cell: (info) =>
			info.getValue()
				? `$${info.getValue().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
				: "$0.00",
	}),
	paymentPlanColumnHelper.accessor("term_start_date", {
		header: "Start Date",
		cell: (info) => formatDate(info.getValue()),
	}),
	paymentPlanColumnHelper.accessor("term_end_date", {
		header: "End Date",
		cell: (info) => formatDate(info.getValue()),
	}),
	paymentPlanColumnHelper.display({
		id: "actions",
		header: "Actions",
		cell: (info) => (
			<div className="flex gap-2">
				<ManagePaymentPlanModal 
					clientId={clientId} 
					paymentPlan={info.row.original}
					mode="edit"
				>
					<Button variant="ghost" size="sm">
						<Edit className="h-4 w-4" />
					</Button>
				</ManagePaymentPlanModal>
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						setDeleteModal({
							isOpen: true,
							type: "payment_plan",
							id: info.row.original.id,
							title: `Delete payment plan "${info.row.original.name}"`,
						})
					}
				>
					<Trash2 className="h-4 w-4 text-red-600" />
				</Button>
			</div>
		),
	}),
	];
};

const paymentSlotColumnHelper = createColumnHelper<any>();
const paymentSlotColumns = [
	paymentSlotColumnHelper.accessor("amount_due", {
		header: "Amount Due",
		cell: (info) =>
			`$${info.getValue().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
	}),
	paymentSlotColumnHelper.accessor("amount_paid", {
		header: "Amount Paid",
		cell: (info) =>
			`$${info.getValue().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
	}),
	paymentSlotColumnHelper.accessor("due_date", {
		header: "Due Date",
		cell: (info) => formatDate(info.getValue()),
	}),
	paymentSlotColumnHelper.accessor("notes", {
		header: "Notes",
		cell: (info) => info.getValue() || "No notes",
	}),
];

interface DeleteConfirmProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void>;
	title: string;
	description: string;
}

function DeleteConfirm({ isOpen, onOpenChange, onConfirm, title, description }: DeleteConfirmProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleConfirm = async () => {
		setIsDeleting(true);
		try {
			await onConfirm();
			onOpenChange(false);
		} catch (error) {
			console.error("Delete failed:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={isDeleting}
						className="bg-red-600 hover:bg-red-700"
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default function ClientDetailView({ clientId }: ClientDetailViewProps) {
	const { data: client, isLoading, error } = useClient(clientId);
	const queryClient = useQueryClient();
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}>({ isOpen: false, type: "", id: "", title: "" });


	const handleDelete = async () => {
		try {
			switch (deleteModal.type) {
				case "goal":
					await deleteClientGoal(deleteModal.id);
					toast.success("Goal deleted successfully");
					break;
				case "win":
					await deleteClientWin(deleteModal.id);
					toast.success("Win deleted successfully");
					break;
				case "assignment":
					await deleteClientAssignment(deleteModal.id);
					toast.success("Assignment deleted successfully");
					break;
				case "activity_period":
					await deleteClientActivityPeriod(deleteModal.id);
					toast.success("Activity period deleted successfully");
					break;
				case "nps":
					await deleteClientNPSScore(deleteModal.id);
					toast.success("NPS score deleted successfully");
					break;
				case "testimonial":
					await deleteClientTestimonial(deleteModal.id);
					toast.success("Testimonial deleted successfully");
					break;
				case "payment_plan":
					await deleteClientPaymentPlan(deleteModal.id);
					toast.success("Payment plan deleted successfully");
					break;
				default:
					throw new Error("Unknown delete type");
			}

			// Invalidate the client query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: clientQueries.detail(clientId),
			});
		} catch (error) {
			console.error("Error deleting record:", error);
			toast.error("Failed to delete record");
			throw error;
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !client) return <div>Error loading client</div>;

	const fullName = client.name;
	const initials = client.name
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);


	const assignmentColumns = createAssignmentColumns(clientId, setDeleteModal);
	const goalColumns = createGoalColumns(clientId, setDeleteModal);
	const winColumns = createWinColumns(clientId, setDeleteModal);
	const activityPeriodColumns = createActivityPeriodColumns(clientId, setDeleteModal);
	const npsColumns = createNPSColumns(clientId, setDeleteModal);
	const testimonialColumns = createTestimonialColumns(clientId, setDeleteModal);
	const paymentPlanColumns = createPaymentPlanColumns(clientId, setDeleteModal);

	const assignmentTable = useReactTable({
		data: client.client_assignments || [],
		columns: assignmentColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const goalTable = useReactTable({
		data: client.client_goals || [],
		columns: goalColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const winTable = useReactTable({
		data: client.client_wins || [],
		columns: winColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const activityPeriodTable = useReactTable({
		data: client.client_activity_period || [],
		columns: activityPeriodColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const npsTable = useReactTable({
		data: client.client_nps || [],
		columns: npsColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const testimonialTable = useReactTable({
		data: client.client_testimonials || [],
		columns: testimonialColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const paymentPlanTable = useReactTable({
		data: client.payment_plans || [],
		columns: paymentPlanColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<div className="space-y-6 p-6">
			{/* Header Section */}
			<div className="flex items-start justify-between">
				<div className="flex items-center space-x-4">
					<Avatar className="h-16 w-16">
						<AvatarFallback className="font-semibold text-lg">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="font-bold text-2xl">{fullName}</h1>
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
							<label className="font-medium text-muted-foreground text-sm">
								Full Name
							</label>
							<p className="text-sm">{fullName}</p>
						</div>
						<div>
							<label className="font-medium text-muted-foreground text-sm">
								Email
							</label>
							<p className="text-sm">{client.email}</p>
						</div>
						<div>
							<label className="font-medium text-muted-foreground text-sm">
								Phone
							</label>
							<p className="text-sm">{client.phone || "Not provided"}</p>
						</div>
						<div>
							<label className="font-medium text-muted-foreground text-sm">
								Overall Status
							</label>
							<p className="text-sm">
								<StatusBadge>{client.overall_status}</StatusBadge>
							</p>
						</div>
						<div>
							<label className="font-medium text-muted-foreground text-sm">
								Everfit Access
							</label>
							<p className="text-sm">
								<StatusBadge>{client.everfit_access}</StatusBadge>
							</p>
						</div>
						{client.team_ids && (
							<div>
								<label className="font-medium text-muted-foreground text-sm">
									Team IDs
								</label>
								<p className="text-sm">{client.team_ids}</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Onboarding & Status Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircle2 className="h-5 w-5" />
							Onboarding & Status
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<label className="font-medium text-muted-foreground text-sm">
								Onboarding Call
							</label>
							<div className="flex items-center space-x-2">
								{client.onboarding_call_completed ? (
									<CheckCircle2 className="h-4 w-4 text-green-600" />
								) : (
									<XCircle className="h-4 w-4 text-red-600" />
								)}
								<span className="text-sm">
									{client.onboarding_call_completed
										? "Completed"
										: "Not Completed"}
								</span>
							</div>
						</div>
						<div className="flex items-center justify-between">
							<label className="font-medium text-muted-foreground text-sm">
								Two Week Check-in Call
							</label>
							<div className="flex items-center space-x-2">
								{client.two_week_check_in_call_completed ? (
									<CheckCircle2 className="h-4 w-4 text-green-600" />
								) : (
									<XCircle className="h-4 w-4 text-red-600" />
								)}
								<span className="text-sm">
									{client.two_week_check_in_call_completed
										? "Completed"
										: "Not Completed"}
								</span>
							</div>
						</div>
						<div className="flex items-center justify-between">
							<label className="font-medium text-muted-foreground text-sm">
								VIP Terms Signed
							</label>
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
						{client.onboarding_completed_date && (
							<div>
								<label className="font-medium text-muted-foreground text-sm">
									Onboarding Completed Date
								</label>
								<p className="text-sm">
									{formatDate(client.onboarding_completed_date)}
								</p>
							</div>
						)}
						{client.offboard_date && (
							<div>
								<label className="font-medium text-muted-foreground text-sm">
									Offboard Date
								</label>
								<p className="text-sm">{formatDate(client.offboard_date)}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Onboarding Notes */}
			{client.onboarding_notes && (
				<Card>
					<CardHeader>
						<CardTitle>Onboarding Notes</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="whitespace-pre-wrap text-sm">
							{client.onboarding_notes}
						</p>
					</CardContent>
				</Card>
			)}

			{/* Children Level Info Sections */}

			{/* Assigned Coaches */}
			{client.client_assignments && client.client_assignments.length > 0 ? (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5" />
								Assigned Coaches
							</CardTitle>
							<ManageAssignmentModal clientId={client.id} mode="add" />
						</div>
					</CardHeader>
					<CardContent>
						<UniversalDataTable
							table={assignmentTable}
							emptyStateMessage="No coaches assigned to this client"
						/>
					</CardContent>
				</Card>
			) : (
				<NoAssignments clientId={client.id} />
			)}

			{/* Client Goals */}
			{client.client_goals && client.client_goals.length > 0 ? (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<Target className="h-5 w-5" />
								Goals
							</CardTitle>
							<ManageGoalModal clientId={client.id} mode="add" />
						</div>
					</CardHeader>
					<CardContent>
						<UniversalDataTable
							table={goalTable}
							emptyStateMessage="No goals set for this client"
						/>
					</CardContent>
				</Card>
			) : (
				<NoGoals clientId={client.id} />
			)}

			{/* Client Wins */}
			{client.client_wins && client.client_wins.length > 0 ? (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<CheckCircle2 className="h-5 w-5" />
								Wins
							</CardTitle>
							<ManageWinModal clientId={client.id} mode="add" />
						</div>
					</CardHeader>
					<CardContent>
						<UniversalDataTable
							table={winTable}
							emptyStateMessage="No wins recorded for this client"
						/>
					</CardContent>
				</Card>
			) : (
				<NoWins clientId={client.id} />
			)}

			{/* Activity Periods */}
			{client.client_activity_period &&
			client.client_activity_period.length > 0 ? (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								Activity Periods
							</CardTitle>
							<ManageActivityPeriodModal clientId={client.id} mode="add" />
						</div>
					</CardHeader>
					<CardContent>
						<UniversalDataTable
							table={activityPeriodTable}
							emptyStateMessage="No activity periods recorded for this client"
						/>
					</CardContent>
				</Card>
			) : (
				<NoActivityPeriods clientId={client.id} />
			)}

			{/* NPS Scores */}
			{client.client_nps && client.client_nps.length > 0 ? (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<Star className="h-5 w-5" />
								NPS Scores
							</CardTitle>
							<ManageNPSModal clientId={client.id} mode="add" />
						</div>
					</CardHeader>
					<CardContent>
						<UniversalDataTable
							table={npsTable}
							emptyStateMessage="No NPS scores recorded for this client"
						/>
					</CardContent>
				</Card>
			) : (
				<NoNPS clientId={client.id} />
			)}

			{/* Testimonials */}
			{client.client_testimonials && client.client_testimonials.length > 0 ? (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<MessageSquare className="h-5 w-5" />
								Testimonials
							</CardTitle>
							<ManageTestimonialModal clientId={client.id} mode="add" />
						</div>
					</CardHeader>
					<CardContent>
						<UniversalDataTable
							table={testimonialTable}
							emptyStateMessage="No testimonials collected from this client"
						/>
					</CardContent>
				</Card>
			) : (
				<NoTestimonials clientId={client.id} />
			)}

			{/* Payment Plans */}
			{client.payment_plans && client.payment_plans.length > 0 ? (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<CreditCard className="h-5 w-5" />
								Payment Plans
							</CardTitle>
							<ManagePaymentPlanModal clientId={client.id} mode="add" />
						</div>
					</CardHeader>
					<CardContent>
						<UniversalDataTable
							table={paymentPlanTable}
							emptyStateMessage="No payment plans setup for this client"
						/>
					</CardContent>
				</Card>
			) : (
				<NoPaymentPlans clientId={client.id} />
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
					<div>
						<label className="font-medium text-muted-foreground text-sm">
							Created At
						</label>
						<p className="text-sm">{formatDate(client.created_at)}</p>
					</div>
					<div>
						<label className="font-medium text-muted-foreground text-sm">
							Last Updated
						</label>
						<p className="text-sm">{formatDate(client.updated_at)}</p>
					</div>
				</CardContent>
			</Card>

			{/* Delete Confirmation Modal */}
			<DeleteConfirm
				isOpen={deleteModal.isOpen}
				onOpenChange={(open) =>
					setDeleteModal({ ...deleteModal, isOpen: open })
				}
				onConfirm={handleDelete}
				title={deleteModal.title}
				description="This action cannot be undone. This will permanently delete the record."
			/>

		</div>
	);
}
