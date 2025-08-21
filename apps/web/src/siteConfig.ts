export const siteConfig = {
	name: "Warrior Babe",
	logo: {
		// Path to your logo files (relative to public folder)
		light: "/logo.png", // Light mode logo
		dark: "/logo_dark.png", // Dark mode logo
		src: "/logo.png", // Fallback for backward compatibility
	},
	email: {
		// Sender email for notifications and auth emails
		from: "noreply@warriorbabe.com", // Change this to your sender email
	},
};

export type siteConfig = typeof siteConfig;
