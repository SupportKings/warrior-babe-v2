import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import ClientTestimonialsHeader from "@/features/clients/layout/client-testimonials.header";

export default function ClientTestimonialsLoading() {
	return (
		<MainLayout headers={[<ClientTestimonialsHeader key="client-testimonials-header" />]}>
			<div className="space-y-6 p-6">
				<div className="space-y-4">
					<Skeleton className="h-8 w-32" />
					<div className="space-y-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
