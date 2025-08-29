import MainLayout from "@/components/layout/main-layout";

import ClientActivityPeriodAddHeader from "@/features/client_activity_period/layout/client_activity_period.add.header";

export default function ClientActivityPeriodAddSkeleton() {
	return (
		<MainLayout headers={[<ClientActivityPeriodAddHeader key="header" />]}>
			<div className="p-6">
				<div className="space-y-6">
					{/* Basic Information Section */}
					<div className="space-y-4">
						<div className="h-4 w-32 animate-pulse rounded bg-muted" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{/* Client Selection */}
							<div className="space-y-2">
								<div className="h-3 w-16 animate-pulse rounded bg-muted" />
								<div className="h-10 w-full animate-pulse rounded bg-muted" />
							</div>
							{/* Coach Selection */}
							<div className="space-y-2">
								<div className="h-3 w-16 animate-pulse rounded bg-muted" />
								<div className="h-10 w-full animate-pulse rounded bg-muted" />
							</div>
						</div>
					</div>

					{/* Date Information Section */}
					<div className="space-y-4">
						<div className="h-4 w-32 animate-pulse rounded bg-muted" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{/* Start Date */}
							<div className="space-y-2">
								<div className="h-3 w-20 animate-pulse rounded bg-muted" />
								<div className="h-10 w-full animate-pulse rounded bg-muted" />
							</div>
							{/* End Date */}
							<div className="space-y-2">
								<div className="h-3 w-16 animate-pulse rounded bg-muted" />
								<div className="h-10 w-full animate-pulse rounded bg-muted" />
							</div>
						</div>
					</div>

					{/* Status Section */}
					<div className="space-y-4">
						<div className="h-4 w-16 animate-pulse rounded bg-muted" />
						<div className="flex items-center space-x-2">
							<div className="h-5 w-9 animate-pulse rounded-full bg-muted" />
							<div className="h-3 w-24 animate-pulse rounded bg-muted" />
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3">
						<div className="h-10 w-20 animate-pulse rounded bg-muted" />
						<div className="h-10 w-40 animate-pulse rounded bg-muted" />
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
