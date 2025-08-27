"use client";

import { getAllRoles } from "../actions/get-roles";
import { useQuery } from "@tanstack/react-query";

export const rolesQueries = {
	all: () => ({
		queryKey: ["roles", "all"],
		queryFn: () => getAllRoles(),
	}),
};

export const useRoles = () => {
	return useQuery(rolesQueries.all());
};