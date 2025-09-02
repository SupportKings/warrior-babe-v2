import MainLayout from "@/components/layout/main-layout";
import ActivityPeriodDetailHeader from "../layout/activity-period.detail.header";

interface ActivityPeriodDetailSkeletonProps {
	activityPeriodId: string;
}

export default function ActivityPeriodDetailSkeleton({
	activityPeriodId,
}: ActivityPeriodDetailSkeletonProps) {
	return (
		<MainLayout
			headers={[
				<ActivityPeriodDetailHeader key="activity-period-detail-header" activityPeriodId={activityPeriodId} />,
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

				{/* Cards skeleton */}
				<div className="grid gap-6">
					{/* Basic Info Card */}
					<div className="rounded-lg border p-6">
						<div className="mb-4 h-6 w-48 rounded bg-muted" />
						<div className="space-y-4">
							{[...Array(6)].map((_, i) => (
								<div key={i}>
									<div className="mb-2 h-4 w-24 rounded bg-muted" />
									<div className="h-4 w-full rounded bg-muted" />
								</div>
							))}
						</div>
					</div>

					{/* System Info Card */}
					<div className="rounded-lg border p-6">
						<div className="mb-4 h-6 w-40 rounded bg-muted" />
						<div className="space-y-4">
							{[...Array(2)].map((_, i) => (
								<div key={i}>
									<div className="mb-2 h-4 w-24 rounded bg-muted" />
									<div className="h-4 w-48 rounded bg-muted" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}