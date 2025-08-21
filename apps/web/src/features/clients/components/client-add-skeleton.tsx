import MainLayout from "@/components/layout/main-layout";
import ClientAddHeader from "../layout/client-add-header";

export default function ClientAddSkeleton() {
	return (
		<MainLayout
			headers={[
				<ClientAddHeader key="client-add-header" />,
			]}
		>
			<div className="bg-background border rounded-lg p-6 space-y-6">
				<div className="space-y-6 animate-pulse">
					{/* Form sections skeleton */}
					<div className="space-y-4">
						<div className="h-6 bg-muted rounded w-32"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<div className="h-4 bg-muted rounded w-24"></div>
								<div className="h-10 bg-muted rounded"></div>
							</div>
							<div className="space-y-2">
								<div className="h-4 bg-muted rounded w-24"></div>
								<div className="h-10 bg-muted rounded"></div>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="h-6 bg-muted rounded w-40"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<div className="h-4 bg-muted rounded w-24"></div>
								<div className="h-10 bg-muted rounded"></div>
							</div>
							<div className="space-y-2">
								<div className="h-4 bg-muted rounded w-32"></div>
								<div className="h-10 bg-muted rounded"></div>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="h-6 bg-muted rounded w-36"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<div className="h-4 bg-muted rounded w-28"></div>
								<div className="h-10 bg-muted rounded"></div>
							</div>
							<div className="space-y-2">
								<div className="h-4 bg-muted rounded w-24"></div>
								<div className="h-10 bg-muted rounded"></div>
							</div>
						</div>
					</div>

					{/* Switch fields skeleton */}
					<div className="space-y-4">
						<div className="h-6 bg-muted rounded w-48"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex items-center space-x-2">
								<div className="h-5 w-10 bg-muted rounded-full"></div>
								<div className="h-4 bg-muted rounded w-36"></div>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-5 w-10 bg-muted rounded-full"></div>
								<div className="h-4 bg-muted rounded w-28"></div>
							</div>
						</div>
						
						{/* Textarea skeleton */}
						<div className="space-y-2">
							<div className="h-4 bg-muted rounded w-32"></div>
							<div className="h-24 bg-muted rounded"></div>
						</div>
					</div>
					
					{/* Action buttons skeleton */}
					<div className="flex justify-end space-x-2 pt-4 border-t">
						<div className="h-10 bg-muted rounded w-20"></div>
						<div className="h-10 bg-muted rounded w-28"></div>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}