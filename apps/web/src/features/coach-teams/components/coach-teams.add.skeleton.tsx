import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { CoachTeamsAddHeader } from "../layout/coach-teams.add.header";

export function CoachTeamsAddSkeleton() {
	return (
		<MainLayout headers={[<CoachTeamsAddHeader key="coach-teams-add-header" />]}>
			<div className="space-y-6 p-6">
				{/* Basic Information Section */}
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Team Name Field */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>

						{/* Premier Coach Field */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-10 w-full" />
						</div>

						{/* Coach Field */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-3 w-64" />
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex justify-end gap-3">
					<Skeleton className="h-10 w-20" />
					<Skeleton className="h-10 w-28" />
				</div>
			</div>
		</MainLayout>
	);
}
