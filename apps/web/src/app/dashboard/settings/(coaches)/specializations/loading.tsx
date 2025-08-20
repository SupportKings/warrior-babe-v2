import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import SpecializationsHeader from "@/features/specializations/layout/specializations-header";

export default function SpecializationsLoading() {
	return (
		<MainLayout 
			headers={[
				<SpecializationsHeader 
					key="specializations-header" 
					permissions={[]} 
				/>
			]}
		>
			<div className="space-y-6 p-6">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-96" />
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-10 w-32" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				</div>
			</div>
		</MainLayout>
	);
}