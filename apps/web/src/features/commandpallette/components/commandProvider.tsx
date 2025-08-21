"use client";

import { KBarProvider } from "kbar";
import { useNavigationActions } from "../actions/navigation";
import { useThemeActions } from "../actions/theme";
export const CommandProvider = ({
	children,
	permissions,
}: {
	children: React.ReactNode;
	permissions?: any;
}) => {
	const themeActions = useThemeActions();
	const navigationActions = useNavigationActions({ permissions });

	const actions: any[] = [...navigationActions, ...themeActions];

	return (
		<KBarProvider
			actions={actions}
			options={{
				disableScrollbarManagement: true,
			}}
		>
			{children}
		</KBarProvider>
	);
};
