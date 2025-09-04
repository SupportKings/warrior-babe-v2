"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
	createProductPaymentPlanTemplate,
	updateProductPaymentPlanTemplate,
} from "@/features/products/actions/relations/payment-plan-templates";
import { productQueries } from "@/features/products/queries/useProducts";

import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentSlot {
	amount_due: number;
	months_to_delay: number;
}

interface ManagePaymentPlanTemplateModalProps {
	productId: string;
	mode: "add" | "edit";
	paymentPlanTemplate?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManagePaymentPlanTemplateModal({
	productId,
	mode,
	paymentPlanTemplate,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManagePaymentPlanTemplateModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		name: "",
		program_length_months: 1,
		slots: [{ amount_due: 0, months_to_delay: 0 }] as PaymentSlot[],
	});

	// Track which inputs are focused to handle zero display
	const [focusedInputs, setFocusedInputs] = useState<Set<string>>(new Set());

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && paymentPlanTemplate) {
			setFormData({
				name: paymentPlanTemplate.name || "",
				program_length_months: paymentPlanTemplate.program_length_months || 1,
				slots: paymentPlanTemplate.payment_plan_template_slots?.map(
					(slot: any) => ({
						amount_due: slot.amount_due || 0,
						months_to_delay: slot.months_to_delay || 0,
					}),
				) || [{ amount_due: 0, months_to_delay: 0 }],
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				name: "",
				program_length_months: 1,
				slots: [{ amount_due: 0, months_to_delay: 0 }],
			});
		}
	}, [isEdit, paymentPlanTemplate, open]);

	const handleAddSlot = () => {
		setFormData((prev) => ({
			...prev,
			slots: [...prev.slots, { amount_due: 0, months_to_delay: 0 }],
		}));
	};

	const handleRemoveSlot = (index: number) => {
		setFormData((prev) => ({
			...prev,
			slots: prev.slots.filter((_, i) => i !== index),
		}));
	};

	const handleSlotChange = (
		index: number,
		field: keyof PaymentSlot,
		value: string,
	) => {
		// Parse the value, allowing for empty string and decimal inputs
		const numValue = value === "" ? 0 : Number.parseFloat(value);

		setFormData((prev) => ({
			...prev,
			slots: prev.slots.map((slot, i) =>
				i === index
					? { ...slot, [field]: isNaN(numValue) ? 0 : numValue }
					: slot,
			),
		}));
	};

	const handleInputFocus = (inputId: string) => {
		setFocusedInputs((prev) => new Set(prev).add(inputId));
	};

	const handleInputBlur = (inputId: string) => {
		setFocusedInputs((prev) => {
			const newSet = new Set(prev);
			newSet.delete(inputId);
			return newSet;
		});
	};

	const getDisplayValue = (value: number, inputId: string): string => {
		// If the input is focused and value is 0, show empty string
		if (focusedInputs.has(inputId) && value === 0) {
			return "";
		}
		// Otherwise show the actual value
		return value.toString();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.name.trim()) {
			toast.error("Template name is required");
			return;
		}

		if (formData.slots.length === 0) {
			toast.error("At least one payment slot is required");
			return;
		}

		// Validate that total of slots doesn't exceed reasonable amount
		const totalAmount = formData.slots.reduce(
			(sum, slot) => sum + slot.amount_due,
			0,
		);
		if (totalAmount <= 0) {
			toast.error("Total amount must be greater than 0");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && paymentPlanTemplate) {
				await updateProductPaymentPlanTemplate(
					paymentPlanTemplate.id,
					formData,
				);
				toast.success("Payment plan template updated successfully!");
			} else {
				await createProductPaymentPlanTemplate(productId, formData);
				toast.success("Payment plan template added successfully!");
			}

			// Invalidate the product query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: productQueries.detail(productId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} payment plan template:`,
				error,
			);
			toast.error(
				`Failed to ${isEdit ? "update" : "add"} payment plan template`,
			);
		} finally {
			setIsLoading(false);
		}
	};

	const calculateTotalAmount = () => {
		return formData.slots.reduce((sum, slot) => sum + slot.amount_due, 0);
	};

	return (
		<>
			{externalOpen === undefined && (
				<Button
					variant="outline"
					size="sm"
					className="gap-2"
					onClick={() => setOpen(true)}
				>
					{isEdit ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
					{isEdit ? "Edit Template" : "Add Template"}
				</Button>
			)}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<CreditCard className="h-5 w-5" />
							{isEdit
								? "Edit Payment Plan Template"
								: "Add New Payment Plan Template"}
						</DialogTitle>
						<DialogDescription>
							{isEdit
								? "Update the payment plan template details."
								: "Add a new payment plan template for this product."}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Template Name */}
						<div>
							<Label htmlFor="name">Template Name *</Label>
							<Input
								id="name"
								placeholder="e.g., 3-Month Payment Plan"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								required
							/>
						</div>

						{/* Program Length */}
						<div>
							<Label htmlFor="program_length_months">
								Program Length (months) *
							</Label>
							<Input
								id="program_length_months"
								type="number"
								min="1"
								max="60"
								value={formData.program_length_months}
								onChange={(e) =>
									setFormData({
										...formData,
										program_length_months: Number.parseInt(e.target.value) || 1,
									})
								}
								required
							/>
						</div>

						{/* Payment Slots */}
						<div>
							<Label>Payment Slots *</Label>
							<div className="mt-2 space-y-2">
								{formData.slots.map((slot, index) => (
									<div
										key={index}
										className="flex items-center gap-2 rounded border p-2"
									>
										<div className="flex-1">
											<Label htmlFor={`amount_${index}`} className="text-xs">
												Amount Due
											</Label>
											<Input
												id={`amount_${index}`}
												type="number"
												min="0"
												step="0.01"
												value={getDisplayValue(
													slot.amount_due,
													`amount_${index}`,
												)}
												onChange={(e) =>
													handleSlotChange(index, "amount_due", e.target.value)
												}
												onFocus={() => handleInputFocus(`amount_${index}`)}
												onBlur={() => handleInputBlur(`amount_${index}`)}
												placeholder="0.00"
											/>
										</div>
										<div className="flex-1">
											<Label htmlFor={`delay_${index}`} className="text-xs">
												Months to Delay
											</Label>
											<Input
												id={`delay_${index}`}
												type="number"
												min="0"
												max="59"
												value={getDisplayValue(
													slot.months_to_delay,
													`delay_${index}`,
												)}
												onChange={(e) =>
													handleSlotChange(
														index,
														"months_to_delay",
														e.target.value,
													)
												}
												onFocus={() => handleInputFocus(`delay_${index}`)}
												onBlur={() => handleInputBlur(`delay_${index}`)}
												placeholder="0"
											/>
										</div>
										{formData.slots.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => handleRemoveSlot(index)}
												className="mt-5"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</div>
								))}
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleAddSlot}
								className="mt-2"
							>
								<Plus className="mr-1 h-4 w-4" />
								Add Slot
							</Button>
						</div>

						{/* Total Amount Display */}
						<div className="rounded bg-muted p-3">
							<div className="flex items-center justify-between">
								<span className="font-medium">Total Amount:</span>
								<span className="font-bold text-lg">
									${calculateTotalAmount().toFixed(2)}
								</span>
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
										? "Update Template"
										: "Add Template"}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
