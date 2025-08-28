import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CoachDetailSkeletonProps {
	coachId: string;
}

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