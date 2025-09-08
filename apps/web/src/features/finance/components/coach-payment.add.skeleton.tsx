import MainLayout from "@/components/layout/main-layout";
import CoachPaymentAddHeader from "../layout/coach-payment.add.header";

export default function CoachPaymentAddSkeleton() {
	return (
		<MainLayout
			headers={[<CoachPaymentAddHeader key="coach-payment-add-header" />]}
		>
			<div className="animate-pulse space-y-6 p-6">
				{/* Basic Information Card */}
				<div className="rounded-lg border p-6">
					<div className="mb-6">
						<div className="h-6 w-40 rounded bg-muted" />
						<div className="mt-2 h-4 w-64 rounded bg-muted" />
					</div>
					<div className="grid gap-6 md:grid-cols-2">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="space-y-2">
								<div className="h-4 w-20 rounded bg-muted" />
								<div className="h-10 w-full rounded bg-muted" />
							</div>
						))}
					</div>
				</div>

				{/* Activity Periods Card */}
				<div className="rounded-lg border p-6">
					<div className="mb-6">
						<div className="h-6 w-48 rounded bg-muted" />
						<div className="mt-2 h-4 w-80 rounded bg-muted" />
					</div>
					<div className="space-y-3">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="flex items-start space-x-3 rounded-lg border p-3">
								<div className="h-5 w-5 rounded bg-muted" />
								<div className="flex-1 space-y-2">
									<div className="h-4 w-32 rounded bg-muted" />
									<div className="h-3 w-48 rounded bg-muted" />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Action buttons */}
				<div className="flex justify-end gap-4">
					<div className="h-10 w-24 rounded bg-muted" />
					<div className="h-10 w-32 rounded bg-muted" />
				</div>
			</div>
		</MainLayout>
	);
}