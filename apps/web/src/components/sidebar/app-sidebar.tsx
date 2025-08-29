"use client";

import type * as React from "react";

// Use Better Auth's built-in type inference
import type { authClient } from "@/lib/auth-client";

import { Link } from "@/components/fastLink";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { NavCollapsible } from "@/components/sidebar/nav-collapsible";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import { Logo } from "@/components/ui/logo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
	ArrowLeft,
	BrickWallFireIcon,
	CreditCard,
	FocusIcon,
	GoalIcon,
	InboxIcon,
	Settings,
	ShieldCheckIcon,
	Star,
	Users,
} from "lucide-react";
import { NavMain } from "./nav-main";

type Session = typeof authClient.$Infer.Session;

// Reusable components and data (kept for future use)

// Back to main navigation button
function BackToMainButton() {
	return (
		<Link
			href="/dashboard"
			className="before:-inset-2 relative m-0 inline-flex h-6 min-w-6 shrink-0 cursor-default select-none items-center justify-center whitespace-nowrap rounded-[5px] border border-transparent border-solid bg-transparent py-0 pr-1.5 pl-0.5 font-medium text-[13px] text-muted-foreground transition-all duration-150 before:absolute before:content-[''] hover:bg-accent hover:text-accent-foreground disabled:cursor-default disabled:opacity-60"
		>
			<ArrowLeft className="mr-1.5 h-4 w-4" />
			Back to app
		</Link>
	);
}

// Settings navigation items
const settingsNavItems = [
	{
		name: "Account",
		items: [
			{
				icon: <Users size={16} />,
				name: "Profile",
				href: "/dashboard/settings/profile",
			},
			{
				icon: <BrickWallFireIcon size={16} />,
				name: "Security & Access",
				href: "/dashboard/settings/security",
			},
		],
	},

	{
		name: "Administration",
		items: [
			{
				icon: <Users size={16} />,
				name: "Team",
				href: "/dashboard/settings/team",
			},
		],
	},
	{
		name: "Coaches",
		items: [
			{
				icon: <ShieldCheckIcon size={16} />,
				name: "Certifications",
				href: "/dashboard/settings/certifications",
			},
			{
				icon: <FocusIcon size={16} />,
				name: "Specializations",
				href: "/dashboard/settings/specializations",
			},
		],
	},
	{
		name: "Clients",
		items: [
			{
				icon: <GoalIcon size={16} />,
				name: "Goals",
				href: "/dashboard/settings/goals",
			},
		],
	},
];

export function AppSidebar({
	session,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	session: Session;
}) {
	const isImpersonating =
		session.session.impersonatedBy !== null &&
		session.session.impersonatedBy !== undefined;

	// Navigation data with full structure
	const data = {
		navMain: [
			{
				title: "Clients",
				url: "#",
				icon: Users,
				items: [
					{
						title: "Clients",
						url: "/dashboard/clients",
					},
					{
						title: "Activity Periods",
						url: "/dashboard/clients/activity-periods",
					},
					{
						title: "Call Feedback",
						url: "/dashboard/clients/call-feedback",
					},
					{
						title: "Testimonials",
						url: "/dashboard/clients/testimonials",
					},
				],
			},
			{
				title: "Coaches",
				url: "#",
				icon: Star,
				items: [
					{
						title: "Coaches",
						url: "/dashboard/coaches",
					},
					{
						title: "Teams",
						url: "/dashboard/coaches/teams",
					},
					{
						title: "Premier Coaches",
						url: "/dashboard/coaches/premiere-coaches",
					},
				],
			},
			{
				title: "Finance",
				url: "#",
				icon: CreditCard,
				items: [
					{
						title: "Payments",
						url: "/dashboard/finance/payments",
					},
					{
						title: "Coach Payments",
						url: "/dashboard/finance/coach-payments",
					},
				],
			},
			{
				title: "System Config",
				url: "#",
				icon: Settings,
				items: [
					{
						title: "Payment Plan Templates",
						url: "/dashboard/system-config/payment-plan-templates",
					},
					{
						title: "Products",
						url: "/dashboard/system-config/products",
					},
					{
						title: "Financial Settings",
						url: "/dashboard/system-config/financial-settings",
					},
					{
						title: "Checklist Settings",
						url: "/dashboard/system-config/checklist-settings",
					},
					{
						title: "Client Win Tags",
						url: "/dashboard/system-config/client-win-tags",
					},
				],
			},
		],
		mainNav: [
			{
				name: "Inbox",
				url: "/dashboard",
				icon: InboxIcon,
			},
		],
	};

	return (
		<Sidebar variant="inset" className="w-64" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<Logo width={48} height={48} />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<div className="flex h-full flex-col px-2">
					{/* Show impersonation banner at the top if impersonating */}
					{isImpersonating && <ImpersonationBanner session={session} />}

					<div className="mt-4">
						<NavMain items={data.mainNav} />
					</div>
					<div className="mt-8">
						<NavCollapsible items={data.navMain} />
					</div>

					<NavSecondary className="mt-auto" />
				</div>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={session.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
