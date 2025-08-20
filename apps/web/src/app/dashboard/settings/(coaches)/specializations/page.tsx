import { Suspense } from "react";
import { redirect } from "next/navigation";

import { admin, coach, user } from "@/lib/permissions";
import MainLayout from "@/components/layout/main-layout";

import SpecializationsHeader from "@/features/specializations/layout/specializations-header";
import SpecializationsTable from "@/features/specializations/components/specializations-table";
import { specializationQueries } from "@/features/coaches/queries/specializations.queries";
import { specializationCategoryQueries } from "@/features/specializations/queries/categories.queries";
import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import SpecializationsLoading from "./loading";

export default function SpecializationsPage() {
	return (
		<Suspense fallback={<SpecializationsLoading />}>
			<SpecializationsPageAsync />
		</Suspense>
	);
}

async function SpecializationsPageAsync() {
	const queryClient = new QueryClient();

	// Parallelize data fetching
	const [session] = await Promise.all([
		getUser(),
		queryClient.prefetchQuery(specializationQueries.allSpecializations()),
		queryClient.prefetchQuery(specializationCategoryQueries.all()),
	]);

	if (!session) {
		redirect("/");
	}

	// Get the user's role from the session and map to permissions
	const userRole = session.user.role || "user";
	const rolePermissions = {
		admin,
		user,
		coach,
	};

	const rawRolePermissions =
		rolePermissions[userRole as keyof typeof rolePermissions] || user;

	// Extract only the statements data (not the functions) for client component
	const permissionStatements = rawRolePermissions.statements;

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<SpecializationsHeader 
						key="specializations-header" 
						permissions={permissionStatements} 
					/>,
				]}
			>
				<div className="h-screen">
					<SpecializationsTable permissions={permissionStatements} />
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}

