"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllRoles } from "../actions/get-roles";

export const rolesQueries = {
	all: () => ({
		queryKey: ["roles", "all"],
		queryFn: () => getAllRoles(),
	}),
};

export const useRoles = () => {
	return useQuery(rolesQueries.all());
};
