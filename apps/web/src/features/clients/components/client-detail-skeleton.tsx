import MainLayout from "@/components/layout/main-layout";
import ClientDetailHeader from "../layout/client-detail-header";

interface ClientDetailSkeletonProps {
	clientId: string;
}

export default function ClientDetailSkeleton({ clientId }: ClientDetailSkeletonProps) {
	return (
		<MainLayout
			headers={[
				<ClientDetailHeader key="client-detail-header" clientId={clientId} />,
			]}
		>
			<div className="space-y-6 animate-pulse p-6">
				{/* Header skeleton */}
				<div className="flex items-start justify-between">
					<div className="flex items-start space-x-4">
						<div className="h-16 w-16 bg-muted rounded-full"></div>
						<div className="space-y-2">
							<div className="h-8 bg-muted rounded w-48"></div>
							<div className="h-4 bg-muted rounded w-64"></div>
							<div className="h-4 bg-muted rounded w-40"></div>
							<div className="flex space-x-2">
								<div className="h-6 bg-muted rounded w-16"></div>
								<div className="h-6 bg-muted rounded w-24"></div>
							</div>
						</div>
					</div>
					<div className="h-10 bg-muted rounded w-32"></div>
				</div>

				{/* Cards skeleton */}
				<div className="grid gap-6 md:grid-cols-2">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="border rounded-lg p-6">
							<div className="h-6 bg-muted rounded w-32 mb-4"></div>
							<div className="space-y-3">
								<div className="h-4 bg-muted rounded w-full"></div>
								<div className="h-4 bg-muted rounded w-3/4"></div>
								<div className="h-4 bg-muted rounded w-1/2"></div>
							</div>
						</div>
					))}
				</div>

				{/* Additional content skeleton */}
				<div className="space-y-4">
					{[...Array(2)].map((_, i) => (
						<div key={i} className="border rounded-lg p-6">
							<div className="h-6 bg-muted rounded w-40 mb-4"></div>
							<div className="space-y-3">
								{[...Array(3)].map((_, j) => (
									<div key={j} className="flex items-center justify-between p-3 border rounded-lg">
										<div className="space-y-1">
											<div className="h-4 bg-muted rounded w-32"></div>
											<div className="h-3 bg-muted rounded w-48"></div>
										</div>
										<div className="h-3 bg-muted rounded w-24"></div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</MainLayout>
	);
}