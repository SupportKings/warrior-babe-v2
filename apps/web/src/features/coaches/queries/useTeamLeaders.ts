"use client";

import { getAllPotentialTeamLeaders } from "../actions/get-coach-teams";
import { useQuery } from "@tanstack/react-query";

export const teamLeadersQueries = {
	all: () => ({
		queryKey: ["team-leaders", "all"],
		queryFn: () => getAllPotentialTeamLeaders(),
	}),
};

export const useTeamLeaders = () => {
	return useQuery(teamLeadersQueries.all());
};