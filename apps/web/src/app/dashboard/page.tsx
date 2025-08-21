import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import DashboardHeader from "@/features/dashboard/layout/dashboard-header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import DashboardLoading from "./loading";

export default function Home() {
	return (
		<Suspense fallback={<DashboardLoading />}>
			<HomeAsync />
		</Suspense>
	);
}

async function HomeAsync() {
	const queryClient = new QueryClient();

	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<DashboardHeader key="dashboard-header" />]}>
				<div />
			</MainLayout>
		</HydrationBoundary>
	);
}
