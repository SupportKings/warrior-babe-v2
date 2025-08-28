"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllPotentialTeamLeaders } from "../actions/get-coach-teams";

export const teamLeadersQueries = {
	all: () => ({
		queryKey: ["team-leaders", "all"],
		queryFn: () => getAllPotentialTeamLeaders(),
	}),
};

export const useTeamLeaders = () => {
	return useQuery(teamLeadersQueries.all());
};
