"use client";

import { useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";

import { format } from "date-fns";
import { DollarSign, PlusIcon, TrashIcon } from "lucide-react";

interface PaymentSlot {
	id?: string;
	amount_due: number;
	amount_paid: number;
	due_date: string;
	notes: string;
	payment_id: string;
}

interface ClientPaymentPlan {
	id?: string;
	name: string;
	notes: string;
	platform: string;
	product_id: string;
	subscription_id: string;
	term_start_date: string;
	term_end_date: string;
	total_amount: number;
	total_amount_paid: number;
	type: string;
	payment_slots?: PaymentSlot[];
}

interface ClientPaymentPlansFormProps {
	paymentPlans: ClientPaymentPlan[];
	onChange: (paymentPlans: ClientPaymentPlan[]) => void;
}

export function ClientPaymentPlansForm({
	paymentPlans,
	onChange,
}: ClientPaymentPlansFormProps) {
	const addPaymentPlan = () => {
		const newPaymentPlan: ClientPaymentPlan = {
			name: "",
			notes: "",
			platform: "",
			product_id: "",
			subscription_id: "",
			term_start_date: format(new Date(), "yyyy-MM-dd"),
			term_end_date: "",
			total_amount: 0,
			total_amount_paid: 0,
			type: "PIF",
			payment_slots: [],
		};
		onChange([...paymentPlans, newPaymentPlan]);
	};

	const updatePaymentPlan = (
		index: number,
		updatedPaymentPlan: Partial<ClientPaymentPlan>,
	) => {
		const updatedPaymentPlans = paymentPlans.map((paymentPlan, i) =>
			i === index ? { ...paymentPlan, ...updatedPaymentPlan } : paymentPlan,
		);
		onChange(updatedPaymentPlans);
	};

	const removePaymentPlan = (index: number) => {
		const updatedPaymentPlans = paymentPlans.filter((_, i) => i !== index);
		onChange(updatedPaymentPlans);
	};

	const addPaymentSlot = (planIndex: number) => {
		const plan = paymentPlans[planIndex];
		const newSlot: PaymentSlot = {
			amount_due: 0,
			amount_paid: 0,
			due_date: format(new Date(), "yyyy-MM-dd"),
			notes: "",
			payment_id: "",
		};
		const updatedSlots = [...(plan.payment_slots || []), newSlot];
		updatePaymentPlan(planIndex, { payment_slots: updatedSlots });
	};

	const updatePaymentSlot = (
		planIndex: number,
		slotIndex: number,
		updatedSlot: Partial<PaymentSlot>,
	) => {
		const plan = paymentPlans[planIndex];
		const updatedSlots = (plan.payment_slots || []).map((slot, i) =>
			i === slotIndex ? { ...slot, ...updatedSlot } : slot,
		);
		updatePaymentPlan(planIndex, { payment_slots: updatedSlots });
	};

	const removePaymentSlot = (planIndex: number, slotIndex: number) => {
		const plan = paymentPlans[planIndex];
		const updatedSlots = (plan.payment_slots || []).filter(
			(_, i) => i !== slotIndex,
		);
		updatePaymentPlan(planIndex, { payment_slots: updatedSlots });
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-lg">Payment Plans</h3>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addPaymentPlan}
					className="gap-2"
				>
					<PlusIcon className="h-4 w-4" />
					Add Payment Plan
				</Button>
			</div>

			{paymentPlans.length === 0 && (
				<div className="py-8 text-center text-muted-foreground">
					<p>
						No payment plans added yet. Click "Add Payment Plan" to get started.
					</p>
				</div>
			)}

			{paymentPlans.map((paymentPlan, planIndex) => (
				<div key={planIndex} className="space-y-6 rounded-lg border p-6">
					<div className="flex items-center justify-between">
						<h4 className="font-medium text-lg">
							Payment Plan #{planIndex + 1}
						</h4>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => removePaymentPlan(planIndex)}
							className="text-red-600 hover:text-red-700"
						>
							<TrashIcon className="h-4 w-4" />
						</Button>
					</div>

					<div className="space-y-4">
						<div>
							<Label>Plan Name *</Label>
							<Input
								placeholder="Payment plan name..."
								value={paymentPlan.name}
								onChange={(e) =>
									updatePaymentPlan(planIndex, { name: e.target.value })
								}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label>Type</Label>
								<Select
									value={paymentPlan.type}
									onValueChange={(value) =>
										updatePaymentPlan(planIndex, { type: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="PIF">PIF (Paid in Full)</SelectItem>
										<SelectItem value="2-Pay">2-Pay</SelectItem>
										<SelectItem value="Split Pay">Split Pay</SelectItem>
										<SelectItem value="4-Pay">4-Pay</SelectItem>
										<SelectItem value="CUSTOM">Custom</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label>Platform</Label>
								<Input
									placeholder="Platform (e.g., Stripe, PayPal)"
									value={paymentPlan.platform || ""}
									onChange={(e) =>
										updatePaymentPlan(planIndex, { platform: e.target.value })
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label>Product ID</Label>
								<Input
									placeholder="Product identifier"
									value={paymentPlan.product_id || ""}
									onChange={(e) =>
										updatePaymentPlan(planIndex, { product_id: e.target.value })
									}
								/>
							</div>

							<div>
								<Label>Subscription ID</Label>
								<Input
									placeholder="Subscription identifier"
									value={paymentPlan.subscription_id || ""}
									onChange={(e) =>
										updatePaymentPlan(planIndex, {
											subscription_id: e.target.value,
										})
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label>Term Start Date *</Label>
								<DatePicker
									value={paymentPlan.term_start_date}
									onChange={(date) =>
										updatePaymentPlan(planIndex, {
											term_start_date: date || "",
										})
									}
									placeholder="Select start date"
								/>
							</div>

							<div>
								<Label>Term End Date *</Label>
								<DatePicker
									value={paymentPlan.term_end_date}
									onChange={(date) =>
										updatePaymentPlan(planIndex, { term_end_date: date || "" })
									}
									placeholder="Select end date"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label>Total Amount</Label>
								<div className="relative">
									<DollarSign className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
									<Input
										type="number"
										step="0.01"
										min="0"
										placeholder="0.00"
										value={paymentPlan.total_amount || ""}
										onChange={(e) =>
											updatePaymentPlan(planIndex, {
												total_amount: Number.parseFloat(e.target.value) || 0,
											})
										}
										className="pl-10"
									/>
								</div>
							</div>

							<div>
								<Label>Total Amount Paid</Label>
								<div className="relative">
									<DollarSign className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
									<Input
										type="number"
										step="0.01"
										min="0"
										placeholder="0.00"
										value={paymentPlan.total_amount_paid || ""}
										onChange={(e) =>
											updatePaymentPlan(planIndex, {
												total_amount_paid:
													Number.parseFloat(e.target.value) || 0,
											})
										}
										className="pl-10"
									/>
								</div>
							</div>
						</div>

						<div>
							<Label>Notes</Label>
							<Textarea
								placeholder="Payment plan notes..."
								value={paymentPlan.notes || ""}
								onChange={(e) =>
									updatePaymentPlan(planIndex, { notes: e.target.value })
								}
								rows={3}
							/>
						</div>

						{/* Payment Slots Section */}
						<div className="space-y-4 border-t pt-4">
							<div className="flex items-center justify-between">
								<h5 className="font-medium">Payment Slots</h5>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => addPaymentSlot(planIndex)}
									className="gap-2"
								>
									<PlusIcon className="h-4 w-4" />
									Add Slot
								</Button>
							</div>

							{paymentPlan.payment_slots &&
							paymentPlan.payment_slots.length > 0 ? (
								<div className="space-y-3">
									{paymentPlan.payment_slots.map((slot, slotIndex) => (
										<div
											key={slotIndex}
											className="space-y-3 rounded-lg border p-4"
										>
											<div className="flex items-center justify-between">
												<span className="font-medium text-sm">
													Slot #{slotIndex + 1}
												</span>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() =>
														removePaymentSlot(planIndex, slotIndex)
													}
													className="text-red-600 hover:text-red-700"
												>
													<TrashIcon className="h-3 w-3" />
												</Button>
											</div>

											<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
												<div>
													<Label className="text-xs">Amount Due</Label>
													<div className="relative">
														<DollarSign className="absolute top-2 left-2 h-3 w-3 text-muted-foreground" />
														<Input
															type="number"
															step="0.01"
															min="0"
															placeholder="0.00"
															value={slot.amount_due || ""}
															onChange={(e) =>
																updatePaymentSlot(planIndex, slotIndex, {
																	amount_due:
																		Number.parseFloat(e.target.value) || 0,
																})
															}
															className="pl-8 text-sm"
														/>
													</div>
												</div>

												<div>
													<Label className="text-xs">Amount Paid</Label>
													<div className="relative">
														<DollarSign className="absolute top-2 left-2 h-3 w-3 text-muted-foreground" />
														<Input
															type="number"
															step="0.01"
															min="0"
															placeholder="0.00"
															value={slot.amount_paid || ""}
															onChange={(e) =>
																updatePaymentSlot(planIndex, slotIndex, {
																	amount_paid:
																		Number.parseFloat(e.target.value) || 0,
																})
															}
															className="pl-8 text-sm"
														/>
													</div>
												</div>

												<div>
													<Label className="text-xs">Due Date</Label>
													<DatePicker
														value={slot.due_date}
														onChange={(date) =>
															updatePaymentSlot(planIndex, slotIndex, {
																due_date: date || "",
															})
														}
														placeholder="Due date"
													/>
												</div>
											</div>

											{slot.notes && (
												<div>
													<Label className="text-xs">Notes</Label>
													<Textarea
														placeholder="Slot notes..."
														value={slot.notes || ""}
														onChange={(e) =>
															updatePaymentSlot(planIndex, slotIndex, {
																notes: e.target.value,
															})
														}
														rows={2}
														className="text-sm"
													/>
												</div>
											)}
										</div>
									))}
								</div>
							) : (
								<div className="py-4 text-center text-muted-foreground text-sm">
									<p>
										No payment slots added yet. Click "Add Slot" to create
										payment schedule.
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
