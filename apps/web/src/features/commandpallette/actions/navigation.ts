"use client";

import React, { useMemo } from "react";

import type { Action } from "kbar";
import {
	ChartLineIcon,
	CreditCard,
	InboxIcon,
	Settings,
	Ticket,
	Users,
} from "lucide-react";

interface NavigationActionsProps {
	permissions?: any;
}

export function useNavigationActions({
	permissions,
}: NavigationActionsProps = {}): Action[] {
	return useMemo(() => {
		const actions: Action[] = [];

		// Always available - Dashboard/Inbox
		actions.push({
			id: "dashboard",
			name: "Go to Dashboard",
			keywords: "dashboard inbox home",
			section: "Navigation",
			icon: React.createElement(InboxIcon, { size: 16 }) as any,
			perform: () => {
				window.location.pathname = "/dashboard";
			},
		});

		// Reports & Analytics - requires analytics.read permission
		if (permissions?.analytics?.includes("read")) {
			actions.push({
				id: "reports",
				name: "Go to Reports & Analytics",
				keywords: "reports analytics overview charts",
				section: "Navigation",
				icon: React.createElement(ChartLineIcon, { size: 16 }) as any,
				perform: () => {
					window.location.pathname = "/dashboard/reports";
				},
			});
		}

		// Clients - requires clients.read permission
		if (permissions?.clients?.includes("read")) {
			actions.push({
				id: "clients",
				name: "Go to Clients",
				keywords: "clients customers users",
				section: "Navigation",
				icon: React.createElement(Users, { size: 16 }) as any,
				perform: () => {
					window.location.pathname = "/dashboard/clients";
				},
			});
		}

		// Coaches - requires coaches.read permission
		if (permissions?.coaches?.includes("read")) {
			actions.push(
				{
					id: "coaches",
					name: "Go to Coaches",
					keywords: "coaches staff team members",
					section: "Navigation",
					icon: React.createElement(Users, { size: 16 }) as any,
					perform: () => {
						window.location.pathname = "/dashboard/coaches";
					},
				},
				{
					id: "capacity",
					name: "Go to Capacity",
					keywords: "capacity scheduling workload",
					section: "Navigation",
					icon: React.createElement(Users, { size: 16 }) as any,
					perform: () => {
						window.location.pathname = "/dashboard/capacity";
					},
				},
			);
		}

		// Support Tickets - requires tickets.read permission
		if (permissions?.tickets?.includes("read")) {
			actions.push({
				id: "tickets",
				name: "Go to Support Tickets",
				keywords: "tickets support help desk",
				section: "Navigation",
				icon: React.createElement(Ticket, { size: 16 }) as any,
				perform: () => {
					window.location.pathname = "/dashboard/tickets";
				},
			});
		}

		// Billing & Finance - requires billing.read permission
		if (permissions?.billing?.includes("read")) {
			actions.push({
				id: "finance",
				name: "Go to Billing & Finance",
				keywords: "billing finance payments invoices",
				section: "Navigation",
				icon: React.createElement(CreditCard, { size: 16 }) as any,
				perform: () => {
					window.location.pathname = "/dashboard/finance";
				},
			});
		}

		// Always available - Settings
		actions.push({
			id: "settings",
			name: "Go to Settings",
			keywords: "settings profile configuration",
			section: "Navigation",
			icon: React.createElement(Settings, { size: 16 }) as any,
			perform: () => {
				window.location.pathname = "/dashboard/settings/profile";
			},
		});

		return actions;
	}, [permissions]);
}
