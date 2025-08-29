"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

import { createClientActivityPeriodAction } from "@/features/client_activity_period/actions/createClientActivityPeriod";
import {
	type ClientActivityPeriodFormInput,
	getAllValidationErrors,
	validateSingleField,
} from "@/features/client_activity_period/types/clientActivityPeriod";
import { coachQueries } from "@/features/coaches/queries/useCoaches";

import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ClientActivityPeriodFormProps {
	mode?: "create" | "edit";
	initialData?: ClientActivityPeriodFormInput;
	onSuccess?: () => void;
}

export function ClientActivityPeriodForm({
	mode = "create",
	initialData,
	onSuccess,
}: ClientActivityPeriodFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [paymentPlanOpen, setPaymentPlanOpen] = useState(false);
	const [coachOpen, setCoachOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();

	// Fetch payment plans and coaches
	const { data: paymentPlans = [] } = useQuery({
		queryKey: ["payment_plans", "with_clients"],
		queryFn: async () => {
			const { getAllPaymentPlansWithClients } = await import(
				"@/features/client_activity_period/actions/getPaymentPlans"
			);
			return getAllPaymentPlansWithClients();
		},
	});

	const { data: coaches = [] } = useQuery({
		queryKey: coachQueries.active(),
		queryFn: async () => {
			const { getActiveCoaches } = await import(
				"@/features/coaches/actions/getCoaches"
			);
			return getActiveCoaches();
		},
	});

	const handleSubmit = async (formData: ClientActivityPeriodFormInput) => {
		setIsSubmitting(true);

		try {
			const result = await createClientActivityPeriodAction(formData);

			if (result?.validationErrors) {
				const errorMessages = Object.entries(result.validationErrors)
					.map(([field, message]) => {
						// Handle nested error objects from next-safe-action
						if (typeof message === 'object' && message !== null) {
							const errorObj = message as any;
							if (errorObj._errors && Array.isArray(errorObj._errors)) {
								return `${field}: ${errorObj._errors.join(', ')}`;
							}
							return `${field}: ${JSON.stringify(message)}`;
						}
						return `${field}: ${message}`;
					})
					.join(", ");
				toast.error(`Validation errors: ${errorMessages}`);
				return;
			}

			if (result?.serverError) {
				toast.error(result.serverError);
				return;
			}

			if (result?.data?.success) {
				// Invalidate relevant queries
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: ["client_activity_periods"],
					}),
					queryClient.invalidateQueries({ queryKey: ["payment_plans"] }),
				]);

				toast.success("Client activity period created successfully");

				if (onSuccess) {
					onSuccess();
				} else {
					router.push("/dashboard/clients/activity-periods");
				}
			}
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	const form = useForm({
		defaultValues: initialData || {
			payment_plan: null,
			coach_id: null,
			start_date: "",
			end_date: null,
			active: true,
		},
		onSubmit: async ({ value }) => {
			await handleSubmit(value);
		},
		validators: {
			onBlur: ({ value }) => {
				const errors = getAllValidationErrors(value);
				return Object.keys(errors).length > 0 ? errors : undefined;
			},
			onChange: ({ value }) => {
				const errors = getAllValidationErrors(value);
				return Object.keys(errors).length > 0 ? errors : undefined;
			},
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			{/* Basic Information */}
			<div className="space-y-4">
				<h3 className="font-medium text-sm">Basic Information</h3>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{/* Payment Plan Selection */}
					<form.Field
						name="payment_plan"
						validators={{
							onBlur: ({ value }) => validateSingleField("payment_plan", value),
							onChange: ({ value }) => validateSingleField("payment_plan", value),
						}}
					>
						{(field) => {
							const selectedPlan = paymentPlans.find(plan => plan.id === field.state.value);
							
							return (
								<div className="space-y-2">
									<Label className="font-medium text-xs">Payment Plan</Label>
									<Popover open={paymentPlanOpen} onOpenChange={setPaymentPlanOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={paymentPlanOpen}
												className="w-full justify-between h-10"
											>
												{selectedPlan
													? selectedPlan.client?.name 
														? `${selectedPlan.client.name} - ${selectedPlan.payment_plan_template?.name || selectedPlan.name}${selectedPlan.product?.name ? ` - ${selectedPlan.product.name}` : ''}`
														: `${selectedPlan.payment_plan_template?.name || selectedPlan.name}${selectedPlan.product?.name ? ` - ${selectedPlan.product.name}` : ''}`
													: "Select payment plan "}
												<ChevronsUpDown className="opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0" align="start" style={{width: 'var(--radix-popover-trigger-width)'}}>
											<Command className="w-full">
												<CommandInput placeholder="Search payment plans..." className="h-9" />
												<CommandList>
													<CommandEmpty>No payment plan found.</CommandEmpty>
													<CommandGroup>
														<CommandItem
															value=""
															onSelect={() => {
																field.handleChange(null);
																setPaymentPlanOpen(false);
															}}
														>
															No payment plan
															<Check
																className={cn(
																	"ml-auto",
																	!field.state.value ? "opacity-100" : "opacity-0"
																)}
															/>
														</CommandItem>
														{paymentPlans.map((plan) => {
															const planName = plan.payment_plan_template?.name || plan.name;
															const displayName = plan.client?.name 
																? `${plan.client.name} - ${planName}${plan.product?.name ? ` - ${plan.product.name}` : ''}`
																: `${planName}${plan.product?.name ? ` - ${plan.product.name}` : ''}`;
															return (
																<CommandItem
																	key={plan.id}
																	value={displayName}
																	onSelect={() => {
																		field.handleChange(field.state.value === plan.id ? null : plan.id);
																		setPaymentPlanOpen(false);
																	}}
																>
																	{displayName}
																	<Check
																		className={cn(
																			"ml-auto",
																			field.state.value === plan.id ? "opacity-100" : "opacity-0"
																		)}
																	/>
																</CommandItem>
															);
														})}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									{field.state.meta.errors && (
										<p className="text-destructive text-xs">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							);
						}}
					</form.Field>

					{/* Coach Selection */}
					<form.Field
						name="coach_id"
						validators={{
							onBlur: ({ value }) => validateSingleField("coach_id", value),
							onChange: ({ value }) => validateSingleField("coach_id", value),
						}}
					>
						{(field) => {
							const selectedCoach = coaches.find(coach => coach.id === field.state.value);
							
							return (
								<div className="space-y-2">
									<Label className="font-medium text-xs">Coach</Label>
									<Popover open={coachOpen} onOpenChange={setCoachOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={coachOpen}
												className="w-full justify-between h-10"
											>
												{selectedCoach
													? selectedCoach.name || "Unknown Coach"
													: "Select coach"}
												<ChevronsUpDown className="opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0" align="start" style={{width: 'var(--radix-popover-trigger-width)'}}>
											<Command className="w-full">
												<CommandInput placeholder="Search coaches..." className="h-9" />
												<CommandList>
													<CommandEmpty>No coach found.</CommandEmpty>
													<CommandGroup>
														<CommandItem
															value=""
															onSelect={() => {
																field.handleChange(null);
																setCoachOpen(false);
															}}
														>
															No coach assigned
															<Check
																className={cn(
																	"ml-auto",
																	!field.state.value ? "opacity-100" : "opacity-0"
																)}
															/>
														</CommandItem>
														{coaches.map((coach) => (
															<CommandItem
																key={coach.id}
																value={coach.name || "Unknown Coach"}
																onSelect={() => {
																	field.handleChange(field.state.value === coach.id ? null : coach.id);
																	setCoachOpen(false);
																}}
															>
																{coach.name || "Unknown Coach"}
																<Check
																	className={cn(
																		"ml-auto",
																		field.state.value === coach.id ? "opacity-100" : "opacity-0"
																	)}
																/>
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									{field.state.meta.errors && (
										<p className="text-destructive text-xs">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							);
						}}
					</form.Field>
				</div>
			</div>

			{/* Date Information */}
			<div className="space-y-4">
				<h3 className="font-medium text-sm">Date Information</h3>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{/* Start Date */}
					<form.Field
						name="start_date"
						validators={{
							onBlur: ({ value }) => validateSingleField("start_date", value),
							onChange: ({ value }) => validateSingleField("start_date", value),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="start_date" className="font-medium text-xs">
									Start Date *
								</Label>
								<DatePicker
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="Select start date"
								/>
								{field.state.meta.errors && (
									<p className="text-destructive text-xs">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					{/* End Date */}
					<form.Field
						name="end_date"
						validators={{
							onBlur: ({ value }) => validateSingleField("end_date", value),
							onChange: ({ value }) => validateSingleField("end_date", value),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="end_date" className="font-medium text-xs">
									End Date
								</Label>
								<DatePicker
									value={field.state.value || ""}
									onChange={(value) => field.handleChange(value || null)}
									placeholder="Select end date "
								/>
								{field.state.meta.errors && (
									<p className="text-destructive text-xs">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Status */}
			<div className="space-y-4">
				<h3 className="font-medium text-sm">Status</h3>
				<form.Field name="active">
					{(field) => (
						<div className="flex items-center space-x-2">
							<Switch
								id="active"
								checked={field.state.value}
								onCheckedChange={field.handleChange}
							/>
							<Label htmlFor="active" className="font-medium text-xs">
								Active Period
							</Label>
						</div>
					)}
				</form.Field>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-3 justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						if (onSuccess) {
							onSuccess();
						} else {
							router.push("/dashboard/clients/activity-periods");
						}
					}}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{mode === "create" ? "Create" : "Update"} Activity Period
				</Button>
			</div>
		</form>
	);
}
