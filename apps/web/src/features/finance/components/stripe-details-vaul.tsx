"use client";

import type { Database } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";

import { format } from "date-fns";
import {
	CalendarIcon,
	CreditCardIcon,
	DollarSignIcon,
	InfoIcon,
	XIcon,
} from "lucide-react";
import { Drawer } from "vaul";

type StripeCharge = Database["stripe"]["Tables"]["charges"]["Row"];

interface StripeDetailsVaulProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	stripeDetails: StripeCharge | null;
	isLoading?: boolean;
}

export function StripeDetailsVaul({
	open,
	onOpenChange,
	stripeDetails,
	isLoading = false,
}: StripeDetailsVaulProps) {
	const formatAmount = (amount: number | null) => {
		if (!amount) return "$0.00";
		return `$${(amount / 100).toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`;
	};

	const formatDate = (timestamp: number | null) => {
		if (!timestamp) return "N/A";
		return format(new Date(timestamp * 1000), "MMM dd, yyyy 'at' h:mm a");
	};

	if (isLoading) {
		return (
			<Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
				<Drawer.Portal>
					<Drawer.Overlay className="fixed inset-0 bg-black/40" />
					<Drawer.Content
						className="fixed top-2 right-2 bottom-2 z-10 flex w-[600px] outline-none"
						style={
							{
								"--initial-transform": "calc(100% + 8px)",
							} as React.CSSProperties
						}
					>
						<div className="flex h-full w-full grow flex-col rounded-[16px] bg-white p-6 shadow-xl dark:bg-zinc-900">
							<Drawer.Title className="mb-2 font-semibold text-foreground">
								Loading Stripe Details...
							</Drawer.Title>
							<Drawer.Description className="mb-6 text-muted-foreground text-sm">
								Please wait while we fetch the payment details.
							</Drawer.Description>
							<div className="flex items-center justify-center py-8">
								<div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
							</div>
						</div>
					</Drawer.Content>
				</Drawer.Portal>
			</Drawer.Root>
		);
	}

	if (!stripeDetails) {
		return (
			<Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
				<Drawer.Portal>
					<Drawer.Overlay className="fixed inset-0 bg-black/40" />
					<Drawer.Content
						className="fixed top-2 right-2 bottom-2 z-10 flex w-[600px] outline-none"
						style={
							{
								"--initial-transform": "calc(100% + 8px)",
							} as React.CSSProperties
						}
					>
						<div className="flex h-full w-full grow flex-col rounded-[16px] bg-white p-6 shadow-xl dark:bg-zinc-900">
							<Drawer.Title className="mb-2 font-semibold text-foreground">
								No Details Available
							</Drawer.Title>
							<Drawer.Description className="mb-6 text-muted-foreground text-sm">
								Could not load Stripe payment details.
							</Drawer.Description>
							<div className="mt-auto">
								<Button variant="outline" onClick={() => onOpenChange(false)}>
									Close
								</Button>
							</div>
						</div>
					</Drawer.Content>
				</Drawer.Portal>
			</Drawer.Root>
		);
	}

	return (
		<Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
			<Drawer.Portal>
				<Drawer.Overlay className="fixed inset-0 bg-black/40" />
				<Drawer.Content
				className="fixed top-2 right-2 bottom-2 z-10 flex w-[600px] outline-none"
				style={
					{ "--initial-transform": "calc(100% + 8px)" } as React.CSSProperties
				}
			>
					<div className="flex h-full w-full grow flex-col rounded-[16px] bg-white shadow-xl dark:bg-zinc-900">
						<div className="p-6">
							<Drawer.Title className="mb-2 flex items-center gap-2 font-semibold text-foreground">
								<CreditCardIcon className="h-5 w-5" />
								Stripe Payment Details
							</Drawer.Title>
							<Drawer.Description className="text-muted-foreground text-sm">
								Transaction ID: {stripeDetails.id}
							</Drawer.Description>
						</div>

						<ScrollArea className="flex-1 px-6">
							<div className="space-y-4 pb-4">
								{/* Payment Overview */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-lg">
											<DollarSignIcon className="h-4 w-4" />
											Payment Overview
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-muted-foreground text-sm">Amount</p>
												<p className="font-semibold text-lg">
													{formatAmount(stripeDetails.amount)}
												</p>
											</div>
											<div>
												<p className="text-muted-foreground text-sm">Status</p>
												<StatusBadge>
													{stripeDetails.status || "Unknown"}
												</StatusBadge>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-muted-foreground text-sm">
													Currency
												</p>
												<p className="font-medium">
													{stripeDetails.currency?.toUpperCase() || "N/A"}
												</p>
											</div>
											<div>
												<p className="text-muted-foreground text-sm">
													Captured
												</p>
												<StatusBadge>
													{stripeDetails.captured ? "Yes" : "No"}
												</StatusBadge>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Transaction Details */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-lg">
											<CalendarIcon className="h-4 w-4" />
											Transaction Details
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div>
											<p className="text-muted-foreground text-sm">Created</p>
											<p className="font-medium">
												{formatDate(stripeDetails.created)}
											</p>
										</div>
										{stripeDetails.description && (
											<div>
												<p className="text-muted-foreground text-sm">
													Description
												</p>
												<p className="font-medium">
													{stripeDetails.description}
												</p>
											</div>
										)}
										{stripeDetails.customer && (
											<div>
												<p className="text-muted-foreground text-sm">
													Customer ID
												</p>
												<p className="font-mono text-sm">
													{stripeDetails.customer}
												</p>
											</div>
										)}
										{stripeDetails.payment_intent && (
											<div>
												<p className="text-muted-foreground text-sm">
													Payment Intent
												</p>
												<p className="font-mono text-sm">
													{stripeDetails.payment_intent}
												</p>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Refund Information */}
								{stripeDetails.refunded && (
									<Card>
										<CardHeader>
											<CardTitle className="text-lg text-red-600">
												Refund Information
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												<p className="text-muted-foreground text-sm">
													Amount Refunded
												</p>
												<p className="font-semibold text-red-600">
													{formatAmount(stripeDetails.amount_refunded)}
												</p>
											</div>
										</CardContent>
									</Card>
								)}

								{/* Failure Information */}
								{stripeDetails.failure_code && (
									<Card className="border-red-200">
										<CardHeader>
											<CardTitle className="text-lg text-red-600">
												Failure Details
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-2">
											<div>
												<p className="text-muted-foreground text-sm">
													Failure Code
												</p>
												<StatusBadge>{stripeDetails.failure_code}</StatusBadge>
											</div>
											{stripeDetails.failure_message && (
												<div>
													<p className="text-muted-foreground text-sm">
														Failure Message
													</p>
													<p className="text-red-600 text-sm">
														{stripeDetails.failure_message}
													</p>
												</div>
											)}
										</CardContent>
									</Card>
								)}

								{/* Additional Information */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-lg">
											<InfoIcon className="h-4 w-4" />
											Additional Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<p className="text-muted-foreground">Live Mode</p>
												<StatusBadge>
													{stripeDetails.livemode ? "Live" : "Test"}
												</StatusBadge>
											</div>
											<div>
												<p className="text-muted-foreground">Paid</p>
												<StatusBadge>
													{stripeDetails.paid ? "Yes" : "No"}
												</StatusBadge>
											</div>
										</div>
										{stripeDetails.receipt_email && (
											<div>
												<p className="text-muted-foreground text-sm">
													Receipt Email
												</p>
												<p className="font-medium">
													{stripeDetails.receipt_email}
												</p>
											</div>
										)}
										{stripeDetails.receipt_number && (
											<div>
												<p className="text-muted-foreground text-sm">
													Receipt Number
												</p>
												<p className="font-mono text-sm">
													{stripeDetails.receipt_number}
												</p>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Metadata */}
								{stripeDetails.metadata &&
									Object.keys(stripeDetails.metadata as Record<string, any>)
										.length > 0 && (
										<Card>
											<CardHeader>
												<CardTitle className="text-lg">Metadata</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="space-y-2">
													{Object.entries(
														stripeDetails.metadata as Record<string, any>,
													).map(([key, value]) => (
														<div key={key} className="flex justify-between">
															<span className="text-muted-foreground text-sm">
																{key}:
															</span>
															<span className="font-medium text-sm">
																{String(value)}
															</span>
														</div>
													))}
												</div>
											</CardContent>
										</Card>
									)}
							</div>
						</ScrollArea>

						<Separator />
						<div className="p-6">
							<Button
								variant="outline"
								className="w-full"
								onClick={() => onOpenChange(false)}
							>
								<XIcon className="mr-2 h-4 w-4" />
								Close
							</Button>
						</div>
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
