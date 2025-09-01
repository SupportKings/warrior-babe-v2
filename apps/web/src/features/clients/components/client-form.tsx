"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { createClientAction } from "@/features/clients/actions/createClient";
import { saveClientActivityPeriods } from "@/features/clients/actions/relations/activity-periods";
import { saveClientAssignments } from "@/features/clients/actions/relations/assignments";
import { saveClientGoals } from "@/features/clients/actions/relations/goals";
import { saveClientNPSScores } from "@/features/clients/actions/relations/nps-scores";
import { saveClientPaymentPlans } from "@/features/clients/actions/relations/payment-plans";
import { saveClientTestimonials } from "@/features/clients/actions/relations/testimonials";
import { saveClientWins } from "@/features/clients/actions/relations/wins";
import {
	CLIENT_OVERALL_STATUS_OPTIONS,
	type ClientFormInput,
	EVERFIT_ACCESS_OPTIONS,
	getAllValidationErrors,
	validateSingleField,
	validationUtils,
} from "@/features/clients/types/client";
import { useActiveCoaches } from "@/features/coaches/queries/useCoaches";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ClientActivityPeriodsForm } from "./client-activity-periods-form";
import { ClientAssignmentsForm } from "./client-assignments-form";
import { ClientGoalsForm } from "./client-goals-form";
import { ClientNPSForm } from "./client-nps-form";
import { ClientPaymentPlansForm } from "./client-payment-plans-form";
import { ClientTestimonialsForm } from "./client-testimonials-form";
import { ClientWinsForm } from "./client-wins-form";

interface ClientFormProps {
	onSuccess?: () => void;
}

// Using enhanced validation utilities from types/client.ts

export default function ClientForm({ onSuccess }: ClientFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [assignments, setAssignments] = useState<any[]>([]);
	const [goals, setGoals] = useState<any[]>([]);
	const [wins, setWins] = useState<any[]>([]);
	const [activityPeriods, setActivityPeriods] = useState<any[]>([]);
	const [npsScores, setNpsScores] = useState<any[]>([]);
	const [testimonials, setTestimonials] = useState<any[]>([]);
	const [paymentPlans, setPaymentPlans] = useState<any[]>([]);

	const router = useRouter();
	const queryClient = useQueryClient();

	// Fetch available coaches for assignments
	const { data: coaches = [] } = useActiveCoaches();

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			overall_status: "new",
			everfit_access: "new",
			team_ids: "",
			onboarding_call_completed: false,
			two_week_check_in_call_completed: false,
			vip_terms_signed: false,
			onboarding_notes: "",
			onboarding_completed_date: "",
			offboard_date: "",
		},
		onSubmit: async ({ value }) => {
			console.log("Form onSubmit triggered - value:", value);
			setIsLoading(true);

			try {
				const result = await createClientAction(value as ClientFormInput);

				if (result?.data?.success) {
					// Get the client ID from create result
					const clientId = result?.data?.data?.client?.id;

					// Save relations if we have a client ID
					if (clientId) {
						try {
							// Save all relations in parallel
							await Promise.all([
								saveClientAssignments(clientId, assignments),
								saveClientGoals(clientId, goals),
								saveClientWins(clientId, wins),
								saveClientActivityPeriods(clientId, activityPeriods),
								saveClientNPSScores(clientId, npsScores),
								saveClientTestimonials(clientId, testimonials),
								saveClientPaymentPlans(clientId, paymentPlans),
							]);
						} catch (relationError) {
							console.error("Error saving client relations:", relationError);
							toast.warning(
								"Client saved, but there was an issue saving some additional data.",
							);
						}
					}

					toast.success("Client created successfully!");

					// Invalidate queries
					queryClient.invalidateQueries({ queryKey: ["clients"] });

					if (onSuccess) {
						onSuccess();
					} else {
						router.back();
					}
				} else if (result?.validationErrors) {
					// Handle validation errors - show exact error messages
					const allErrors = getAllValidationErrors(result.validationErrors);
					if (allErrors.length > 0) {
						// Show the first error in toast, or combine multiple if they're short
						if (allErrors.length === 1) {
							toast.error(allErrors[0]);
						} else if (allErrors.join(", ").length < 100) {
							toast.error(allErrors.join(", "));
						} else {
							toast.error(
								`${allErrors[0]} (+${allErrors.length - 1} more errors)`,
							);
						}
					} else {
						toast.error("Please check your input and try again.");
					}
				}
			} catch (error) {
				console.error("Form submission error:", error);
				toast.error("An unexpected error occurred. Please try again.");
			} finally {
				setIsLoading(false);
			}
		},
		// validators: {
		// 	onSubmit: async ({ value }) => {
		// 		console.log("Form validation - value:", value);
		// 		const validation = schema.safeParse(value);
		// 		console.log("Form validation - result:", validation);
		// 		if (!validation.success) {
		// 			const errors: Record<string, string> = {};
		// 			validation.error.issues.forEach((issue: any) => {
		// 				if (issue.path[0]) {
		// 					errors[issue.path[0] as string] = issue.message;
		// 				}
		// 			});
		// 			console.log("Form validation - errors:", errors);
		// 			return errors;
		// 		}
		// 		return undefined;
		// 	},
		// },
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit();
			}}
			className="space-y-6"
		>
			{/* Basic Information */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Basic Information</h3>

				<form.Field
					name="name"
					validators={{
						onBlur: ({ value }) =>
							validateSingleField(value, validationUtils.name),
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Full Name *</Label>
							<Input
								id={field.name}
								name={field.name}
								placeholder="Enter full name"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								required
							/>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<p className="text-red-500 text-sm">
										{String(field.state.meta.errors[0] || "")}
									</p>
								)}
						</div>
					)}
				</form.Field>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field
						name="email"
						validators={{
							onChange: ({ value }) => {
								if (value && value.length > 5) {
									return validateSingleField(value, validationUtils.email);
								}
								return undefined;
							},
							onBlur: ({ value }) =>
								validateSingleField(value, validationUtils.email),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email *</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									placeholder="Enter email address"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									required
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>

					<form.Field name="phone">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Phone</Label>
								<Input
									id={field.name}
									name={field.name}
									type="tel"
									placeholder="Enter phone number"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Status */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Status</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="overall_status">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Overall Status</Label>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										{CLIENT_OVERALL_STATUS_OPTIONS.map((status) => (
											<SelectItem key={status.value} value={status.value}>
												{status.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>

					<form.Field name="everfit_access">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Everfit Access</Label>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select access status" />
									</SelectTrigger>
									<SelectContent>
										{EVERFIT_ACCESS_OPTIONS.map((access) => (
											<SelectItem key={access.value} value={access.value}>
												{access.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Onboarding & Preferences */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Onboarding & Preferences</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="onboarding_call_completed">
						{(field) => (
							<div className="flex items-center space-x-2">
								<Switch
									id={field.name}
									checked={field.state.value}
									onCheckedChange={(checked) => field.handleChange(checked)}
								/>
								<Label htmlFor={field.name}>Onboarding Call Completed</Label>
							</div>
						)}
					</form.Field>

					<form.Field name="two_week_check_in_call_completed">
						{(field) => (
							<div className="flex items-center space-x-2">
								<Switch
									id={field.name}
									checked={field.state.value}
									onCheckedChange={(checked) => field.handleChange(checked)}
								/>
								<Label htmlFor={field.name}>
									Two Week Check-in Call Completed
								</Label>
							</div>
						)}
					</form.Field>

					<form.Field name="vip_terms_signed">
						{(field) => (
							<div className="flex items-center space-x-2">
								<Switch
									id={field.name}
									checked={field.state.value}
									onCheckedChange={(checked) => field.handleChange(checked)}
								/>
								<Label htmlFor={field.name}>VIP Terms Signed</Label>
							</div>
						)}
					</form.Field>

					<form.Field name="onboarding_completed_date">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Onboarding Completed Date</Label>
								<DatePicker
									id={field.name}
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="Select completion date"
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Team Assignment */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Team Assignment</h3>

				<form.Field name="team_ids">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Team IDs</Label>
							<Input
								id={field.name}
								name={field.name}
								placeholder="Enter team IDs (comma separated)"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<p className="text-red-500 text-sm">
										{String(field.state.meta.errors[0] || "")}
									</p>
								)}
						</div>
					)}
				</form.Field>
			</div>

			{/* Notes */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Notes</h3>

				<form.Field name="onboarding_notes">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Onboarding Notes</Label>
							<Textarea
								id={field.name}
								name={field.name}
								placeholder="Enter onboarding notes and observations..."
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								rows={4}
							/>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<p className="text-red-500 text-sm">
										{String(field.state.meta.errors[0] || "")}
									</p>
								)}
						</div>
					)}
				</form.Field>
			</div>


			{/* Client Relations */}
			<ClientAssignmentsForm
				assignments={assignments}
				onChange={setAssignments}
				availableCoaches={coaches}
			/>

			<ClientGoalsForm goals={goals} onChange={setGoals} />

			<ClientWinsForm wins={wins} onChange={setWins} />

			<ClientActivityPeriodsForm
				activityPeriods={activityPeriods}
				onChange={setActivityPeriods}
				availableCoaches={coaches}
			/>

			<ClientNPSForm npsScores={npsScores} onChange={setNpsScores} />

			<ClientTestimonialsForm
				testimonials={testimonials}
				onChange={setTestimonials}
			/>

			<ClientPaymentPlansForm
				paymentPlans={paymentPlans}
				onChange={setPaymentPlans}
			/>

			{/* Form Actions */}
			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							disabled={state.isSubmitting || isLoading}
							onClick={() => console.log("Button clicked!")}
						>
							{(state.isSubmitting || isLoading) && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Create Client
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
