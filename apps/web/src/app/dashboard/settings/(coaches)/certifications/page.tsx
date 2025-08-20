import { Suspense } from "react";
import { redirect } from "next/navigation";

import { admin, coach, user } from "@/lib/permissions";
import MainLayout from "@/components/layout/main-layout";

import CertificationsHeader from "@/features/certifications/layout/certifications-header";
import CertificationsTable from "@/features/certifications/components/certifications-table";
import { certificationQueries } from "@/features/coaches/queries/certifications.queries";
import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import CertificationsLoading from "./loading";

export default function CertificationsPage() {
	return (
		<Suspense fallback={<CertificationsLoading />}>
			<CertificationsPageAsync />
		</Suspense>
	);
}

async function CertificationsPageAsync() {
	const queryClient = new QueryClient();

	// Parallelize data fetching
	const [session] = await Promise.all([
		getUser(),
		queryClient.prefetchQuery(certificationQueries.allCertifications()),
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
					<CertificationsHeader 
						key="certifications-header" 
						permissions={permissionStatements} 
					/>,
				]}
			>
				<div className="h-screen">
					<CertificationsTable permissions={permissionStatements} />
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}

