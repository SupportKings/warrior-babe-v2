export const CONTRACT_TYPES = [
	{ value: "W2", label: "W2" },
	{ value: "Hourly", label: "Hourly" },
] as const;

export type ContractType = typeof CONTRACT_TYPES[number]["value"];