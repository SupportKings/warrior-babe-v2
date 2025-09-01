"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

import {
	createClientActivityPeriod,
	updateClientActivityPeriod,
} from "@/features/clients/actions/relations/activity-periods";
import {
	useClientAssignedCoaches,
	useClientPaymentPlans,
} from "@/features/clients/queries/useClientData";
import { clientQueries } from "@/features/clients/queries/useClients";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Check, ChevronsUpDown, Edit, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageActivityPeriodModalProps {
	clientId: string;
	mode: "add" | "edit";
	activityPeriod?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageActivityPeriodModal({
	clientId,
	mode,
	activityPeriod,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageActivityPeriodModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const [paymentPlanOpen, setPaymentPlanOpen] = useState(false);
	const [coachOpen, setCoachOpen] = useState(false);
	const queryClient = useQueryClient();

	// Fetch client's payment plans and coaches using server-side hooks
	const { data: clientPaymentPlans = [] } = useClientPaymentPlans(clientId);
	const { data: clientCoaches = [] } = useClientAssignedCoaches(clientId);

	const [formData, setFormData] = useState({
		active: true,
		start_date: format(new Date(), "yyyy-MM-dd"),
		end_date: "",
		coach_id: null as string | null,
		payment_plan: null as string | null,
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && activityPeriod) {
			setFormData({
				active: activityPeriod.active || true,
				start_date: activityPeriod.start_date
					? format(new Date(activityPeriod.start_date), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				end_date: activityPeriod.end_date
					? format(new Date(activityPeriod.end_date), "yyyy-MM-dd")
					: "",
				coach_id: activityPeriod.coach_id || null,
				payment_plan: activityPeriod.payment_plan || null,
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				active: true,
				start_date: format(new Date(), "yyyy-MM-dd"),
				end_date: "",
				coach_id: null,
				payment_plan: null,
			});
		}
	}, [isEdit, activityPeriod, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);

		try {
			if (isEdit && activityPeriod) {
				await updateClientActivityPeriod(activityPeriod.id, formData);
				toast.success("Activity period updated successfully!");
			} else {
				await createClientActivityPeriod(clientId, formData);
				toast.success("Activity period added successfully!");
			}

			// Invalidate the client query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: clientQueries.detail(clientId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} activity period:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} activity period`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{externalOpen === undefined && (
				<DialogTrigger>
					{children || (
						<Button variant="outline" size="sm" className="gap-2">
							{isEdit ? (
								<Edit className="h-4 w-4" />
							) : (
								<Plus className="h-4 w-4" />
							)}
							{isEdit ? "Edit Activity Period" : "Add Activity Period"}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						{isEdit ? "Edit Activity Period" : "Add New Activity Period"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the activity period details."
							: "Add a new activity period for this client."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex items-center space-x-2">
						<Switch
							id="active"
							checked={formData.active}
							onCheckedChange={(checked) =>
								setFormData({ ...formData, active: checked })
							}
						/>
						<Label htmlFor="active">Active</Label>
					</div>

					{/* Coach Selection */}
					<div>
						<Label htmlFor="coach_id">Coach</Label>
						<Popover open={coachOpen} onOpenChange={setCoachOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={coachOpen}
									className="h-10 w-full justify-between"
								>
									{formData.coach_id
										? clientCoaches.find(
												(coach) => coach?.id === formData.coach_id,
											)?.name || "Unknown Coach"
										: "Select coach (optional)"}
									<ChevronsUpDown className="opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-full p-0"
								align="start"
								style={{ width: "var(--radix-popover-trigger-width)" }}
							>
								<Command className="w-full">
									<CommandInput
										placeholder="Search coaches..."
										className="h-9"
									/>
									<CommandList>
										<CommandEmpty>No coach found.</CommandEmpty>
										<CommandGroup>
											<CommandItem
												value=""
												onSelect={() => {
													setFormData({ ...formData, coach_id: null });
													setCoachOpen(false);
												}}
											>
												No coach assigned
												<Check
													className={cn(
														"ml-auto",
														!formData.coach_id ? "opacity-100" : "opacity-0",
													)}
												/>
											</CommandItem>
											{clientCoaches.map((coach) => (
												<CommandItem
													key={coach?.id}
													value={coach?.name || "Unknown Coach"}
													onSelect={() => {
														setFormData({
															...formData,
															coach_id:
																formData.coach_id === coach?.id
																	? null
																	: coach?.id || null,
														});
														setCoachOpen(false);
													}}
												>
													{coach?.name || "Unknown Coach"}
													<Check
														className={cn(
															"ml-auto",
															formData.coach_id === coach?.id
																? "opacity-100"
																: "opacity-0",
														)}
													/>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					{/* Payment Plan Selection */}
					<div>
						<Label htmlFor="payment_plan">Payment Plan</Label>
						<Popover open={paymentPlanOpen} onOpenChange={setPaymentPlanOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={paymentPlanOpen}
									className="h-10 w-full justify-between"
								>
									{formData.payment_plan
										? (() => {
												const selectedPlan = clientPaymentPlans.find(
													(plan) => plan.id === formData.payment_plan,
												);
												return selectedPlan
													? `${selectedPlan.name}${selectedPlan.products?.name ? ` - ${selectedPlan.products.name}` : ""}`
													: "Unknown Plan";
											})()
										: "Select payment plan (optional)"}
									<ChevronsUpDown className="opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-full p-0"
								align="start"
								style={{ width: "var(--radix-popover-trigger-width)" }}
							>
								<Command className="w-full">
									<CommandInput
										placeholder="Search payment plans..."
										className="h-9"
									/>
									<CommandList>
										<CommandEmpty>No payment plan found.</CommandEmpty>
										<CommandGroup>
											<CommandItem
												value=""
												onSelect={() => {
													setFormData({ ...formData, payment_plan: null });
													setPaymentPlanOpen(false);
												}}
											>
												No payment plan
												<Check
													className={cn(
														"ml-auto",
														!formData.payment_plan
															? "opacity-100"
															: "opacity-0",
													)}
												/>
											</CommandItem>
											{clientPaymentPlans.map((plan) => {
												const displayName = `${plan.name}${plan.products?.name ? ` - ${plan.products.name}` : ""}`;
												return (
													<CommandItem
														key={plan.id}
														value={displayName}
														onSelect={() => {
															setFormData({
																...formData,
																payment_plan:
																	formData.payment_plan === plan.id
																		? null
																		: plan.id,
															});
															setPaymentPlanOpen(false);
														}}
													>
														{displayName}
														<Check
															className={cn(
																"ml-auto",
																formData.payment_plan === plan.id
																	? "opacity-100"
																	: "opacity-0",
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
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="start_date">Start Date *</Label>
							<Input
								id="start_date"
								type="date"
								value={formData.start_date}
								onChange={(e) =>
									setFormData({ ...formData, start_date: e.target.value })
								}
								required
							/>
						</div>

						<div>
							<Label htmlFor="end_date">End Date</Label>
							<Input
								id="end_date"
								type="date"
								value={formData.end_date}
								onChange={(e) =>
									setFormData({ ...formData, end_date: e.target.value })
								}
							/>
						</div>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading
								? isEdit
									? "Updating..."
									: "Adding..."
								: isEdit
									? "Update Activity Period"
									: "Add Activity Period"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
