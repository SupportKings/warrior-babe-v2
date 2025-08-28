import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientActivityPeriodsLoading() {
	return (
		<MainLayout
			headers={[
				<div
					key="header"
					className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6"
				>
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-40" />
					</div>
					<Skeleton className="h-8 w-48" />
				</div>,
			]}
		>
			<div className="space-y-6 p-6">
				<div className="flex items-center gap-2 pb-4">
					<Skeleton className="h-8 w-32" />
					<Skeleton className="h-8 w-32" />
					<Skeleton className="h-8 w-32" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-12 w-full" />
					{Array.from({ length: 10 }, (_, i) => (
						<Skeleton key={`skeleton-${i}`} className="h-16 w-full" />
					))}
				</div>
			</div>
		</MainLayout>
	);
}
