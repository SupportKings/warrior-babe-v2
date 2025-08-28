import MainLayout from "@/components/layout/main-layout";

import ProductsAddHeader from "../layout/products.add.header";

export default function ProductsAddSkeleton() {
	return (
		<MainLayout headers={[<ProductsAddHeader key="products-add-header" />]}>
			<div className="space-y-6 rounded-lg border bg-background p-6">
				<div className="animate-pulse space-y-8">
					{/* Basic Information Section */}
					<div className="space-y-6">
						<div className="h-6 w-40 rounded bg-muted" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<div className="h-4 w-24 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
							<div className="space-y-2 md:col-span-2">
								<div className="h-4 w-20 rounded bg-muted" />
								<div className="h-20 rounded bg-muted" />
							</div>
						</div>
					</div>

					{/* Configuration Section */}
					<div className="space-y-6">
						<div className="h-6 w-32 rounded bg-muted" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<div className="h-4 w-36 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
							<div className="space-y-2">
								<div className="h-4 w-20 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
						</div>
					</div>

					{/* Status Section */}
					<div className="space-y-6">
						<div className="h-6 w-16 rounded bg-muted" />
						<div className="grid grid-cols-1 gap-4">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<div className="h-4 w-20 rounded bg-muted" />
									<div className="h-3 w-64 rounded bg-muted" />
								</div>
								<div className="h-5 w-10 rounded-full bg-muted" />
							</div>
						</div>
					</div>

					{/* Action buttons skeleton */}
					<div className="flex justify-end space-x-4 border-t pt-6">
						<div className="h-10 w-20 rounded bg-muted" />
						<div className="h-10 w-32 rounded bg-muted" />
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
