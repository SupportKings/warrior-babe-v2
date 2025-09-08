"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createPayment } from "../actions/createPayment";
import { updatePayment } from "../actions/updatePayment";
import {
	getAllValidationErrors,
	PAYMENT_METHOD_OPTIONS,
	PAYMENT_PLATFORM_OPTIONS,
	PAYMENT_STATUS_OPTIONS,
	type Payment,
	type PaymentEditFormInput,
	type PaymentFormInput,
	paymentEditFormSchema,
	paymentFormSchema,
	validateSingleField,
} from "../types/payment";

interface PaymentFormProps {
	mode: "create" | "edit";
	initialData?: Payment;
	onSuccess?: () => void;
}

export default function PaymentForm({
	mode = "create",
	initialData,
	onSuccess,
}: PaymentFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize form with TanStack Form
	const form = useForm({
		defaultValues: {
			amount: initialData?.amount?.toString() || "",
			payment_date:
				initialData?.payment_date || format(new Date(), "yyyy-MM-dd"),
			payment_method: initialData?.payment_method || "",
			platform: initialData?.platform || "",
			status: initialData?.status || "",
			...(mode === "edit" && { id: initialData?.id }),
		} as PaymentFormInput | PaymentEditFormInput,
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);

			if (mode === "create") {
				executeCreate(value as PaymentFormInput);
			} else {
				executeUpdate(value as PaymentEditFormInput);
			}
		},
	});

	// Use server actions
	const { execute: executeCreate } = useAction(createPayment, {
		onSuccess: () => {
			toast.success("Payment created successfully");
			if (onSuccess) {
				onSuccess();
			} else {
				router.push("/dashboard/finance/payments");
			}
		},
		onError: (result) => {
			setIsSubmitting(false);
			if (result?.error.serverError) {
				toast.error(result.error.serverError);
			} else if (result?.error.validationErrors) {
				toast.error("Please fix the validation errors");
			} else {
				toast.error("Failed to create payment");
			}
		},
		onSettled: () => {
			setIsSubmitting(false);
		},
	});

	const { execute: executeUpdate } = useAction(updatePayment, {
		onSuccess: () => {
			toast.success("Payment updated successfully");
			if (onSuccess) {
				onSuccess();
			} else {
				router.push("/dashboard/finance/payments");
			}
		},
		onError: (result) => {
			setIsSubmitting(false);
			if (result?.error.serverError) {
				toast.error(result.error.serverError);
			} else if (result?.error.validationErrors) {
				toast.error("Please fix the validation errors");
			} else {
				toast.error("Failed to update payment");
			}
		},
		onSettled: () => {
			setIsSubmitting(false);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			<div className="flex flex-col gap-4">
				{/* Amount Field */}
				<h3 className="mb-4 font-medium text-base text-foreground">
					Basic Information
				</h3>
				<form.Field
					name="amount"
					validators={{
						onBlur: ({ value }) => {
							const validation = validateSingleField("amount", value);
							return validation.isValid ? undefined : validation.error;
						},
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="amount" className="required">
								Amount
							</Label>
							<Input
								id="amount"
								type="text"
								placeholder="0.00"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								className={cn("h-10")}
							/>
						</div>
					)}
				</form.Field>

				{/* Payment Date Field */}
				<form.Field
					name="payment_date"
					validators={{
						onBlur: ({ value }) => {
							const validation = validateSingleField("payment_date", value);
							return validation.isValid ? undefined : validation.error;
						},
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="payment_date" className="required">
								Payment Date
							</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										id="payment_date"
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!field.state.value && "text-muted-foreground",
											field.state.meta.errors.length > 0 &&
												"border-destructive focus-visible:ring-destructive",
											"h-10",
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{field.state.value ? (
											format(new Date(field.state.value), "PPP")
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={
											field.state.value
												? new Date(field.state.value)
												: undefined
										}
										onSelect={(date) => {
											field.handleChange(
												date ? format(date, "yyyy-MM-dd") : "",
											);
										}}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
						</div>
					)}
				</form.Field>
				<form.Field
					name="payment_method"
					validators={{
						onChange: ({ value }) => {
							const validation = validateSingleField("payment_method", value);
							return validation.isValid ? undefined : validation.error;
						},
					}}
				>
					{(field) => (
						<div className="w-fit space-y-2">
							<Label htmlFor="payment_method" className="required">
								Payment Method
							</Label>
							<Select
								value={field.state.value}
								onValueChange={field.handleChange}
							>
								<SelectTrigger
									id="payment_method"
									className={cn(
										field.state.meta.errors.length > 0 &&
											"border-destructive focus-visible:ring-destructive",
										"h-10",
									)}
								>
									<SelectValue placeholder="Select payment method" />
								</SelectTrigger>
								<SelectContent>
									{PAYMENT_METHOD_OPTIONS.map((method) => (
										<SelectItem key={method} value={method}>
											{method
												.split("_")
												.map(
													(word) =>
														word.charAt(0).toUpperCase() + word.slice(1),
												)
												.join(" ")}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
						</div>
					)}
				</form.Field>

				{/* Platform Field */}
				<form.Field
					name="platform"
					validators={{
						onChange: ({ value }) => {
							const validation = validateSingleField("platform", value);
							return validation.isValid ? undefined : validation.error;
						},
					}}
				>
					{(field) => (
						<div className="w-fit space-y-2">
							<Label htmlFor="platform" className="required">
								Platform
							</Label>
							<Select
								value={field.state.value}
								onValueChange={field.handleChange}
							>
								<SelectTrigger
									id="platform"
									className={cn(
										field.state.meta.errors.length > 0 &&
											"border-destructive focus-visible:ring-destructive",
										"h-10",
									)}
								>
									<SelectValue placeholder="Select platform" />
								</SelectTrigger>
								<SelectContent>
									{PAYMENT_PLATFORM_OPTIONS.map((platform) => (
										<SelectItem key={platform} value={platform}>
											{platform
												.split("_")
												.map(
													(word) =>
														word.charAt(0).toUpperCase() + word.slice(1),
												)
												.join(" ")}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
						</div>
					)}
				</form.Field>

				{/* Status Field */}
				<form.Field
					name="status"
					validators={{
						onChange: ({ value }) => {
							const validation = validateSingleField("status", value);
							return validation.isValid ? undefined : validation.error;
						},
					}}
				>
					{(field) => (
						<div className="w-fit space-y-2">
							<Label htmlFor="status" className="required">
								Status
							</Label>
							<Select
								value={field.state.value}
								onValueChange={field.handleChange}
							>
								<SelectTrigger
									id="status"
									className={cn(
										field.state.meta.errors.length > 0 &&
											"border-destructive focus-visible:ring-destructive",
										"h-10",
									)}
								>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									{PAYMENT_STATUS_OPTIONS.map((status) => (
										<SelectItem
											key={status}
											value={status}
											className="capitalize"
										>
											{status
												.split("_")
												.map(
													(word) =>
														word.charAt(0).toUpperCase() + word.slice(1),
												)
												.join(" ")}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
						</div>
					)}
				</form.Field>
			</div>

			{/* Action Buttons */}
			<div className="flex justify-end gap-4 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<span className="mr-2">
								{mode === "create" ? "Creating..." : "Updating..."}
							</span>
						</>
					) : (
						<>{mode === "create" ? "Create Payment" : "Update Payment"}</>
					)}
				</Button>
			</div>
		</form>
	);
}
