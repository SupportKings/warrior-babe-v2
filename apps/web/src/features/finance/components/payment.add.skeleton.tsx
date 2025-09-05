import MainLayout from "@/components/layout/main-layout";

import PaymentAddHeader from "../layout/payment.add.header";

export default function PaymentAddSkeleton() {
	return (
		<MainLayout headers={[<PaymentAddHeader key="payment-add-header" />]}>
			<div className="p-6">
				<div className="animate-pulse space-y-6">
					{/* Basic Information Section */}
					<div className="space-y-4">
						<div className="h-5 w-32 rounded bg-muted" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{/* Amount Field */}
							<div className="space-y-2">
								<div className="h-4 w-16 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
							{/* Payment Date Field */}
							<div className="space-y-2">
								<div className="h-4 w-24 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
						</div>
					</div>

					{/* Payment Details Section */}
					<div className="space-y-4">
						<div className="h-5 w-32 rounded bg-muted" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{/* Payment Method Field */}
							<div className="space-y-2">
								<div className="h-4 w-28 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
							{/* Platform Field */}
							<div className="space-y-2">
								<div className="h-4 w-20 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
							{/* Status Field */}
							<div className="space-y-2">
								<div className="h-4 w-16 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end gap-4 pt-4">
						<div className="h-10 w-20 rounded bg-muted" />
						<div className="h-10 w-32 rounded bg-muted" />
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
