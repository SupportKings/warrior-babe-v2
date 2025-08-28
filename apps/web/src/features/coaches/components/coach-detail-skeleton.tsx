import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CoachDetailSkeletonProps {
	coachId: string;
}

/**
 * Renders a skeleton (loading) UI for the coach detail screen.
 *
 * The component displays a placeholder card with an avatar and multiple labeled value rows to
 * indicate loading state while coach details are fetched. Layout is responsive (1/2/3 columns).
 *
 * @param coachId - Coach identifier; accepted for prop consistency but not used by this skeleton component.
 * @returns A React element representing the skeleton UI for a coach detail view.
 */
export default function CoachDetailSkeleton({
	coachId,
}: CoachDetailSkeletonProps) {
	return (
		<div className="space-y-6 p-6">
			{/* General Information Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-4">
						<Skeleton className="h-16 w-16 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-6 w-full" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Additional sections can be added here */}
		</div>
	);
}