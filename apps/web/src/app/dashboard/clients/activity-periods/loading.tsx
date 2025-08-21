import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import ActivityPeriodsHeader from "@/features/clients/layout/activity.periods.header";

export default function ActivityPeriodsLoading() {
	return (
		<MainLayout
			headers={[<ActivityPeriodsHeader key="activity-periods-header" />]}
		>
			<div className="space-y-6 p-6">
				<div className="space-y-2">
					<Skeleton className="h-10 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Skeleton className="h-32 w-full rounded-lg" />
					<Skeleton className="h-32 w-full rounded-lg" />
					<Skeleton className="h-32 w-full rounded-lg" />
					<Skeleton className="h-32 w-full rounded-lg" />
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<Skeleton className="h-64 w-full rounded-lg" />
					<Skeleton className="h-64 w-full rounded-lg" />
				</div>
			</div>
		</MainLayout>
	);
}
