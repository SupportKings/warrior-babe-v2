"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
	createClientPaymentPlan,
	updateClientPaymentPlan,
} from "@/features/clients/actions/relations/payment-plans";
import { clientQueries } from "@/features/clients/queries/useClients";
import {
	usePaymentPlanTemplateSlots,
	usePaymentPlanTemplates,
} from "@/features/system-config/queries/usePaymentPlanTemplates";
import { useActiveProducts } from "@/features/system-config/queries/useProducts";

import { useQueryClient } from "@tanstack/react-query";
import { addMonths, format } from "date-fns";
import {
	CalendarIcon,
	Clock,
	CreditCard,
	DollarSign,
	Edit,
	Plus,
} from "lucide-react";
import { toast } from "sonner";

interface ManagePaymentPlanModalProps {
	clientId: string;
	mode: "add" | "edit";
	paymentPlan?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManagePaymentPlanModal({
	clientId,
	mode,
	paymentPlan,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManagePaymentPlanModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
	const [customSlots, setCustomSlots] = useState<
		Array<{ amount_due: number; months_to_delay: number }>
	>([]);
	const queryClient = useQueryClient();

	// Queries for payment plan templates and products
	const { data: templates = [], isLoading: templatesLoading } =
		usePaymentPlanTemplates();
	const { data: templateSlots = [], isLoading: slotsLoading } =
		usePaymentPlanTemplateSlots(selectedTemplateId);
	const { data: products = [], isLoading: productsLoading } =
		useActiveProducts();

	const [formData, setFormData] = useState({
		name: "",
		notes: "",
		product_id: "",
		term_start_date: format(new Date(), "yyyy-MM-dd"),
		term_end_date: "",
		total_amount: 0,
		type: "", // This will now be the payment_plan_template ID
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && paymentPlan) {
			setFormData({
				name: paymentPlan.name || "",
				notes: paymentPlan.notes || "",
				product_id: paymentPlan.product_id || "",
				term_start_date: paymentPlan.term_start_date
					? format(new Date(paymentPlan.term_start_date), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				term_end_date: paymentPlan.term_end_date
					? format(new Date(paymentPlan.term_end_date), "yyyy-MM-dd")
					: "",
				total_amount: paymentPlan.total_amount || 0,
				type: paymentPlan.type || "",
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				name: "",
				notes: "",
				product_id: "",
				term_start_date: format(new Date(), "yyyy-MM-dd"),
				term_end_date: "",
				total_amount: 0,
				type: "",
			});
		}
	}, [isEdit, paymentPlan, open]);

	// Update selected template ID when form type changes
	useEffect(() => {
		if (formData.type === "custom") {
			setSelectedTemplateId("");
			// Auto-create 2 default custom slots if none exist
			if (customSlots.length === 0) {
				setCustomSlots([
					{ amount_due: 0, months_to_delay: 0 },
					{ amount_due: 0, months_to_delay: 1 },
				]);
			}
		} else {
			setSelectedTemplateId(formData.type);
			// Clear custom slots when switching to template
			setCustomSlots([]);
		}
	}, [formData.type, customSlots.length]);

	// Auto-prefill product and calculate term_end_date when template is selected (not for custom)
	useEffect(() => {
		if (formData.type && formData.type !== "custom" && templates.length > 0) {
			const selectedTemplate = templates.find((t) => t.id === formData.type);
			if (selectedTemplate) {
				const updates: any = {};

				// Auto-prefill product
				if (selectedTemplate.product_id) {
					updates.product_id = selectedTemplate.product_id;
				}

				// Auto-calculate term_end_date from program_length_months
				if (
					selectedTemplate.program_length_months &&
					formData.term_start_date
				) {
					const startDate = new Date(formData.term_start_date);
					const endDate = addMonths(
						startDate,
						selectedTemplate.program_length_months,
					);
					updates.term_end_date = format(endDate, "yyyy-MM-dd");
				}

				if (Object.keys(updates).length > 0) {
					setFormData((prev) => ({ ...prev, ...updates }));
				}
			}
		}
	}, [formData.type, formData.term_start_date, templates]);

	// Auto-calculate total amount from template slots or custom slots
	useEffect(() => {
		if (formData.type === "custom" && customSlots.length > 0) {
			const totalAmount = customSlots.reduce(
				(sum, slot) => sum + slot.amount_due,
				0,
			);
			if (formData.total_amount !== totalAmount) {
				setFormData((prev) => ({
					...prev,
					total_amount: totalAmount,
				}));
			}
		} else if (templateSlots.length > 0 && formData.type !== "custom") {
			const totalAmount = templateSlots.reduce(
				(sum, slot) => sum + slot.amount_due,
				0,
			);
			if (formData.total_amount !== totalAmount) {
				setFormData((prev) => ({
					...prev,
					total_amount: totalAmount,
				}));
			}
		}
	}, [templateSlots, customSlots, formData.type, formData.total_amount]);

	// Custom slot management functions
	const addCustomSlot = () => {
		setCustomSlots((prev) => [...prev, { amount_due: 0, months_to_delay: 0 }]);
	};

	const updateCustomSlot = (
		index: number,
		field: "amount_due" | "months_to_delay",
		value: number,
	) => {
		setCustomSlots((prev) =>
			prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
		);
	};

	const removeCustomSlot = (index: number) => {
		setCustomSlots((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.term_end_date) {
			toast.error("Term end date is required");
			return;
		}

		if (!formData.type) {
			toast.error("Payment plan template is required");
			return;
		}

		if (formData.type === "custom" && customSlots.length === 0) {
			toast.error("At least one payment slot is required for custom plans");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && paymentPlan) {
				await updateClientPaymentPlan(paymentPlan.id, formData);
				toast.success("Payment plan updated successfully!");
			} else {
				const dataToSubmit =
					formData.type === "custom" ? { ...formData, customSlots } : formData;
				await createClientPaymentPlan(clientId, dataToSubmit);
				toast.success("Payment plan added successfully!");
			}

			// Invalidate the client query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: clientQueries.detail(clientId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} payment plan:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} payment plan`);
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
							{isEdit ? "Edit Payment Plan" : "Add Payment Plan"}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						{isEdit ? "Edit Payment Plan" : "Add New Payment Plan"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the payment plan details."
							: "Add a new payment plan for this client."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="type">Payment Plan Template</Label>
						<Select
							value={formData.type}
							onValueChange={(value: string) =>
								setFormData({ ...formData, type: value })
							}
							disabled={templatesLoading}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a payment plan template" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="custom">Custom</SelectItem>
								{templates.map((template) => (
									<SelectItem key={template.id} value={template.id}>
										{template.name}{" "}
										{template.products?.name && `(${template.products.name})`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="product_id">Product</Label>
						<Select
							value={formData.product_id}
							onValueChange={(value: string) =>
								setFormData({ ...formData, product_id: value })
							}
							disabled={
								productsLoading ||
								(formData.type ? formData.type !== "custom" : false)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a product" />
							</SelectTrigger>
							<SelectContent>
								{products.map((product) => (
									<SelectItem key={product.id} value={product.id}>
										{product.name}{" "}
										{product.description && `- ${product.description}`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="flex flex-col space-y-2">
							<Label htmlFor="term_start_date">Term Start Date *</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"h-10 w-full justify-start pl-3 text-left font-normal",
											!formData.term_start_date && "text-muted-foreground",
										)}
									>
										{formData.term_start_date ? (
											format(new Date(formData.term_start_date), "MMM dd, yyyy")
										) : (
											<span>Pick a start date</span>
										)}
										<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={
											formData.term_start_date
												? new Date(formData.term_start_date)
												: undefined
										}
										onSelect={(date) => {
											if (date) {
												setFormData({
													...formData,
													term_start_date: format(date, "yyyy-MM-dd"),
												});
											}
										}}
										captionLayout="dropdown"
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div className="flex flex-col space-y-2">
							<Label htmlFor="term_end_date">Term End Date *</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										disabled={
											formData.type ? formData.type !== "custom" : false
										}
										className={cn(
											"h-10 w-full justify-start pl-3 text-left font-normal",
											!formData.term_end_date && "text-muted-foreground",
										)}
									>
										{formData.term_end_date ? (
											format(new Date(formData.term_end_date), "MMM dd, yyyy")
										) : (
											<span>Pick an end date</span>
										)}
										<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={
											formData.term_end_date
												? new Date(formData.term_end_date)
												: undefined
										}
										onSelect={(date) => {
											if (date) {
												setFormData({
													...formData,
													term_end_date: format(date, "yyyy-MM-dd"),
												});
											}
										}}
										disabled={!!(formData.type && formData.type !== "custom")}
										captionLayout="dropdown"
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					<div>
						<Label htmlFor="notes">Notes</Label>
						<Textarea
							id="notes"
							placeholder="Payment plan notes..."
							value={formData.notes}
							onChange={(e) =>
								setFormData({ ...formData, notes: e.target.value })
							}
							rows={3}
						/>
					</div>

					{/* Template Slots Preview */}
					{selectedTemplateId && templateSlots.length > 0 && (
						<div className="space-y-3 rounded-lg border bg-muted/50 p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<h4 className="font-medium">Payment Schedule Preview</h4>
								</div>
								<div className="font-medium text-sm">
									Total: $
									{templateSlots
										.reduce((sum, slot) => sum + slot.amount_due, 0)
										.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
								</div>
							</div>
							<p className="text-muted-foreground text-sm">
								The following payment slots will be automatically created based
								on the selected template:
							</p>
							<div className="space-y-2">
								{templateSlots.map((slot, index) => {
									const dueDate = formData.term_start_date
										? addMonths(
												new Date(formData.term_start_date),
												slot.months_to_delay,
											)
										: null;

									return (
										<div
											key={slot.id}
											className="flex items-center justify-between rounded border bg-background px-3 py-2 text-sm"
										>
											<span>Payment #{index + 1}</span>
											<div className="flex items-center gap-4">
												<span className="font-medium">
													$
													{slot.amount_due.toLocaleString("en-US", {
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
													})}
												</span>
												<span className="text-muted-foreground">
													{dueDate
														? format(dueDate, "MMM dd, yyyy")
														: "Date TBD"}
												</span>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Custom Slots Management */}
					{formData.type === "custom" && (
						<div className="space-y-3 rounded-lg border bg-muted/50 p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Plus className="h-4 w-4 text-muted-foreground" />
									<h4 className="font-medium">Custom Payment Slots</h4>
								</div>
								<div className="flex items-center gap-3">
									<div className="font-medium text-sm">
										Total: $
										{customSlots
											.reduce((sum, slot) => sum + slot.amount_due, 0)
											.toLocaleString("en-US", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addCustomSlot}
										className="gap-1"
									>
										<Plus className="h-3 w-3" />
										Add Slot
									</Button>
								</div>
							</div>
							<p className="text-muted-foreground text-sm">
								Create custom payment slots with specific amounts and timing:
							</p>
							<div className="space-y-3">
								{customSlots.map((slot, index) => {
									const dueDate = formData.term_start_date
										? addMonths(
												new Date(formData.term_start_date),
												slot.months_to_delay,
											)
										: null;

									return (
										<div
											key={index}
											className="space-y-3 rounded border bg-background p-3"
										>
											<div className="flex items-center justify-between">
												<span className="font-medium text-sm">
													Payment #{index + 1}
												</span>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeCustomSlot(index)}
													className="h-auto p-1 text-red-600 hover:text-red-700"
												>
													<Plus className="h-3 w-3 rotate-45" />
												</Button>
											</div>
											<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
												<div>
													<Label className="text-xs">Amount ($)</Label>
													<div className="relative">
														<DollarSign className="absolute top-2.5 left-2 h-3 w-3 text-muted-foreground" />
														<Input
															type="number"
															step="0.01"
															min="0"
															placeholder="0.00"
															value={slot.amount_due || ""}
															onChange={(e) =>
																updateCustomSlot(
																	index,
																	"amount_due",
																	Number.parseFloat(e.target.value) || 0,
																)
															}
															className="pl-8 text-sm"
														/>
													</div>
												</div>
												<div>
													<Label className="text-xs">Months to Delay</Label>
													<Input
														type="number"
														min="0"
														placeholder="0"
														value={slot.months_to_delay || ""}
														onChange={(e) =>
															updateCustomSlot(
																index,
																"months_to_delay",
																Number.parseInt(e.target.value) || 0,
															)
														}
														className="text-sm"
													/>
												</div>
												<div>
													<Label className="text-xs">Due Date</Label>
													<div className="rounded border bg-muted/50 px-3 py-2 text-muted-foreground text-sm">
														{dueDate
															? format(dueDate, "MMM dd, yyyy")
															: "Set start date"}
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
							{customSlots.length === 0 && (
								<div className="py-4 text-center text-muted-foreground text-sm">
									<p>
										No payment slots added yet. Click "Add Slot" to create your
										payment schedule.
									</p>
								</div>
							)}
						</div>
					)}

					{slotsLoading && selectedTemplateId && (
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<div className="h-4 w-4 animate-spin rounded-full border-current border-b-2" />
							Loading payment schedule...
						</div>
					)}

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
									? "Update Payment Plan"
									: "Add Payment Plan"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
