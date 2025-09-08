"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import {
	type CreateCoachPaymentInput,
	createCoachPayment,
	getCoachClientActivityPeriods,
	getCoachPayment,
	type UpdateCoachPaymentInput,
	updateCoachPayment,
} from "@/features/coaches/actions/coach-payments";

import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

interface ManageCoachPaymentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	coachId: string;
	paymentId?: string;
	mode: "create" | "edit";
}

const PAYMENT_STATUSES = [
	{ value: "Paid", label: "Paid" },
	{ value: "Not Paid", label: "Not Paid" },
];

export function ManageCoachPaymentModal({
	open,
	onOpenChange,
	coachId,
	paymentId,
	mode,
}: ManageCoachPaymentModalProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activityPeriods, setActivityPeriods] = useState<any[]>([]);
	const [openCombobox, setOpenCombobox] = useState(false);
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [formData, setFormData] = useState({
		client_activity_period_id: "",
		amount: "",
		status: "Not Paid",
		date: format(new Date(), "yyyy-MM-dd"),
	});

	// Fetch activity periods when modal opens
	useEffect(() => {
		if (open && mode === "create") {
			fetchActivityPeriods();
		} else if (open && mode === "edit" && paymentId) {
			fetchPaymentData();
			fetchActivityPeriods();
		}
	}, [open, mode, paymentId]);

	const fetchActivityPeriods = async () => {
		try {
			const periods = await getCoachClientActivityPeriods(coachId);
			setActivityPeriods(periods);
		} catch (error) {
			console.error("Error fetching activity periods:", error);
			toast.error("Failed to load activity periods");
		}
	};

	const fetchPaymentData = async () => {
		if (!paymentId) return;

		try {
			const payment: any = await getCoachPayment(paymentId);
			if (payment) {
				const paymentDate = payment?.date ? new Date(payment.date) : new Date();
				setDate(paymentDate);
				setFormData({
					client_activity_period_id: payment.client_activity_period_id || "",
					amount: payment.amount?.toString() || "",
					status: payment.status || "Not Paid",
					date: format(paymentDate, "yyyy-MM-dd"),
				});
			}
		} catch (error) {
			console.error("Error fetching payment data:", error);
			toast.error("Failed to load payment data");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		console.log(formData);
		try {
			if (mode === "create") {
				const input: CreateCoachPaymentInput = {
					coach_id: coachId,
					client_activity_period_id: formData.client_activity_period_id,
					amount: Number.parseFloat(formData.amount),
					status: formData.status as "Paid" | "Not Paid",
					date: formData.date,
				};

				const result = await createCoachPayment(input);
				if (result.success) {
					toast.success(result.message);
					onOpenChange(false);
					router.refresh();
				} else {
					toast.error(result.message);
				}
			} else if (mode === "edit" && paymentId) {
				const input: UpdateCoachPaymentInput = {
					id: paymentId,
					client_activity_period_id: formData.client_activity_period_id,
					amount: Number.parseFloat(formData.amount),
					status: formData.status as "Paid" | "Not Paid",
					date: formData.date,
				};

				const result = await updateCoachPayment(input);
				if (result.success) {
					toast.success(result.message);
					onOpenChange(false);
					router.refresh();
				} else {
					toast.error(result.message);
				}
			}
		} catch (error) {
			console.error("Error submitting payment:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Add New Payment" : "Edit Payment"}
					</DialogTitle>
					<DialogDescription>
						{mode === "create"
							? "Create a new payment record for this coach."
							: "Update the payment details."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label>Client Activity Period</Label>
						<Popover open={openCombobox} onOpenChange={setOpenCombobox}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={openCombobox}
									className="h-10 w-full justify-between"
								>
									{formData.client_activity_period_id
										? activityPeriods.find(
												(period) =>
													period.id === formData.client_activity_period_id,
											)?.label
										: "Select activity period..."}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-full p-0"
								style={{ width: "var(--radix-popover-trigger-width)" }}
							>
								<Command>
									<CommandInput placeholder="Search activity period..." />
									<CommandGroup>
										{activityPeriods.length > 0 ? (
											activityPeriods.map((period) => (
												<CommandItem
													key={period.id}
													value={period.label}
													onSelect={() => {
														setFormData({
															...formData,
															client_activity_period_id: period.id,
														});
														setOpenCombobox(false);
													}}
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															formData.client_activity_period_id === period.id
																? "opacity-100"
																: "opacity-0",
														)}
													/>
													<div className="flex flex-col">
														<span className="text-sm">{period.label}</span>
													</div>
												</CommandItem>
											))
										) : (
											<div className="py-6 text-center text-muted-foreground text-sm">
												No activity periods available
											</div>
										)}
									</CommandGroup>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					<div className="space-y-2">
						<Label htmlFor="amount">Amount</Label>
						<Input
							id="amount"
							type="number"
							step="0.01"
							placeholder="0.00"
							className="h-10"
							value={formData.amount}
							onChange={(e) =>
								setFormData({ ...formData, amount: e.target.value })
							}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label>Payment Date</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										"h-10 w-full justify-start text-left font-normal",
										!date && "text-muted-foreground",
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{date ? format(date, "PPP") : "Pick a date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={date}
									onSelect={(newDate) => {
										setDate(newDate);
										if (newDate) {
											setFormData({
												...formData,
												date: format(newDate, "yyyy-MM-dd"),
											});
										}
									}}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>

					<div className="space-y-2">
						<Label htmlFor="status">Payment Status</Label>
						<Select
							value={formData.status}
							onValueChange={(value) =>
								setFormData({ ...formData, status: value })
							}
						>
							<SelectTrigger className="h-10" id="status">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								{PAYMENT_STATUSES.map((status) => (
									<SelectItem key={status.value} value={status.value}>
										{status.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting
								? mode === "create"
									? "Creating..."
									: "Updating..."
								: mode === "create"
									? "Create Payment"
									: "Update Payment"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
