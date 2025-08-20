import { getOnboardingOverview, getOnboardingMetrics, getOnboardingTemplate, getAllTemplates } from "./server-queries";

export const onboardingQueries = {
	overview: () => ({
		queryKey: ["onboarding", "overview"],
		queryFn: getOnboardingOverview,
	}),
	metrics: () => ({
		queryKey: ["onboarding", "metrics"],
		queryFn: getOnboardingMetrics,
	}),
	template: () => ({
		queryKey: ["onboarding", "template"],
		queryFn: getOnboardingTemplate,
	}),
	allTemplates: () => ({
		queryKey: ["onboarding", "templates", "all"],
		queryFn: getAllTemplates,
	}),
};