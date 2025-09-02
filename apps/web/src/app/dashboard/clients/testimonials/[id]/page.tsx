import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import { getClientTestimonial } from "@/features/client-testimonials/actions/getClientTestimonial";
import ClientTestimonialDetailSkeleton from "@/features/client-testimonials/components/client-testimonial.detail.skeleton";
import ClientTestimonialDetailView from "@/features/client-testimonials/components/client-testimonial.detail.view";
import ClientTestimonialDetailHeader from "@/features/client-testimonials/layout/client-testimonial.detail.header";
import { getUser } from "@/queries/getUser";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface ClientTestimonialDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function ClientTestimonialDetailPage({ params }: ClientTestimonialDetailPageProps) {
	return (
		<Suspense fallback={<ClientTestimonialDetailSkeleton testimonialId="" />}>
			<ClientTestimonialDetailPageAsync params={params} />
		</Suspense>
	);
}

async function ClientTestimonialDetailPageAsync({ params }: ClientTestimonialDetailPageProps) {
	const { id } = await params;

	// Validate that id is provided
	if (!id) {
		notFound();
	}

	const queryClient = new QueryClient();
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Prefetch the testimonial data
	await queryClient.prefetchQuery({
		queryKey: ["client-testimonials", "detail", id],
		queryFn: () => getClientTestimonial(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<ClientTestimonialDetailHeader key="client-testimonial-detail-header" testimonialId={id} />,
				]}
			>
				<ClientTestimonialDetailView testimonialId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}