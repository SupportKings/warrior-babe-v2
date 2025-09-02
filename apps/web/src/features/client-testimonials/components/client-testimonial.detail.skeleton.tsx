import MainLayout from "@/components/layout/main-layout";
import ClientTestimonialDetailHeader from "../layout/client-testimonial.detail.header";

interface ClientTestimonialDetailSkeletonProps {
	testimonialId: string;
}

export default function ClientTestimonialDetailSkeleton({
	testimonialId,
}: ClientTestimonialDetailSkeletonProps) {
	return (
		<MainLayout
			headers={[
				<ClientTestimonialDetailHeader key="client-testimonial-detail-header" testimonialId={testimonialId} />,
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
						</div>
					</div>
				</div>

				{/* Basic Info Card skeleton */}
				<div className="rounded-lg border p-6">
					<div className="mb-4 h-6 w-40 rounded bg-muted" />
					<div className="space-y-4">
						{/* Client field */}
						<div>
							<div className="h-4 w-20 rounded bg-muted mb-2" />
							<div className="h-4 w-48 rounded bg-muted" />
						</div>
						{/* Type field */}
						<div>
							<div className="h-4 w-32 rounded bg-muted mb-2" />
							<div className="h-6 w-24 rounded bg-muted" />
						</div>
						{/* Content field */}
						<div>
							<div className="h-4 w-20 rounded bg-muted mb-2" />
							<div className="space-y-2">
								<div className="h-4 w-full rounded bg-muted" />
								<div className="h-4 w-3/4 rounded bg-muted" />
								<div className="h-4 w-5/6 rounded bg-muted" />
								<div className="h-4 w-2/3 rounded bg-muted" />
							</div>
						</div>
						{/* URL field */}
						<div>
							<div className="h-4 w-32 rounded bg-muted mb-2" />
							<div className="h-4 w-64 rounded bg-muted" />
						</div>
						{/* Date field */}
						<div>
							<div className="h-4 w-28 rounded bg-muted mb-2" />
							<div className="h-4 w-32 rounded bg-muted" />
						</div>
						{/* Recorded by field */}
						<div>
							<div className="h-4 w-24 rounded bg-muted mb-2" />
							<div className="h-4 w-40 rounded bg-muted" />
						</div>
					</div>
				</div>

				{/* System Info Card skeleton */}
				<div className="rounded-lg border p-6">
					<div className="mb-4 h-6 w-40 rounded bg-muted" />
					<div className="space-y-4">
						<div>
							<div className="h-4 w-24 rounded bg-muted mb-2" />
							<div className="h-4 w-48 rounded bg-muted" />
						</div>
						<div>
							<div className="h-4 w-28 rounded bg-muted mb-2" />
							<div className="h-4 w-48 rounded bg-muted" />
						</div>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}