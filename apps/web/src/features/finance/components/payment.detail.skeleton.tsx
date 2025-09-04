import MainLayout from "@/components/layout/main-layout";
import PaymentDetailHeader from "../layout/payment.detail.header";

interface PaymentDetailSkeletonProps {
	paymentId: string;
}

export default function PaymentDetailSkeleton({
	paymentId,
}: PaymentDetailSkeletonProps) {
	return (
		<MainLayout
			headers={[
				<PaymentDetailHeader key="payment-detail-header" paymentId={paymentId} />,
			]}
		>
			<div className="animate-pulse space-y-6 p-6">
				{/* Header skeleton */}
				<div className="flex items-start justify-between">
					<div className="flex items-start space-x-4">
						<div className="h-16 w-16 rounded-full bg-muted" />
						<div className="space-y-2">
							<div className="h-8 w-48 rounded bg-muted" />
							<div className="h-4 w-64 rounded bg-muted" />
							<div className="h-4 w-40 rounded bg-muted" />
						</div>
					</div>
					<div className="h-10 w-32 rounded bg-muted" />
				</div>

				{/* Cards skeleton */}
				<div className="grid gap-6 md:grid-cols-2">
					{[...Array(2)].map((_, i) => (
						<div key={i} className="rounded-lg border p-6">
							<div className="mb-4 h-6 w-32 rounded bg-muted" />
							<div className="space-y-3">
								<div className="h-4 w-full rounded bg-muted" />
								<div className="h-4 w-3/4 rounded bg-muted" />
								<div className="h-4 w-1/2 rounded bg-muted" />
								<div className="h-4 w-full rounded bg-muted" />
								<div className="h-4 w-2/3 rounded bg-muted" />
							</div>
						</div>
					))}
				</div>

				{/* Dispute Information skeleton */}
				<div className="rounded-lg border p-6">
					<div className="mb-4 h-6 w-40 rounded bg-muted" />
					<div className="space-y-3">
						<div className="h-4 w-full rounded bg-muted" />
						<div className="h-4 w-3/4 rounded bg-muted" />
						<div className="h-4 w-1/2 rounded bg-muted" />
						<div className="h-4 w-2/3 rounded bg-muted" />
					</div>
				</div>

				{/* System Information skeleton */}
				<div className="rounded-lg border p-6">
					<div className="mb-4 h-6 w-40 rounded bg-muted" />
					<div className="space-y-3">
						<div className="h-4 w-1/2 rounded bg-muted" />
						<div className="h-4 w-1/2 rounded bg-muted" />
					</div>
				</div>
			</div>
		</MainLayout>
	);
}