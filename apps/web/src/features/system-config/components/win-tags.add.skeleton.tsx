import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { WinTagsAddHeader } from "@/features/system-config/layout/win-tags.add.header";

export function WinTagsAddSkeleton() {
	return (
		<MainLayout headers={[<WinTagsAddHeader />]}>
			<div className="p-6">
				<div className="space-y-6">
					{/* Basic Information Section */}
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-40" />
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Tag Name Field */}
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-10 w-full" />
							</div>

							{/* Color Field */}
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<div className="flex items-center gap-3">
									<Skeleton className="h-10 w-20" />
									<Skeleton className="h-10 w-32" />
									<Skeleton className="h-10 w-10 rounded-md" />
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4">
						<Skeleton className="h-10 w-20" />
						<Skeleton className="h-10 w-32" />
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
