"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { rolesMap } from "@/lib/permissions";
import { actionClient } from "@/lib/safe-action";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

// Create type for all available roles
type RoleType = keyof typeof rolesMap;

const inputSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	role: z.enum(Object.keys(rolesMap) as [RoleType, ...RoleType[]]),
});

export const setUserRole = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput: { userId, role } }) => {
		try {
			const result = await auth.api.setRole({
				body: {
					userId,
					role,
				},
				headers: await headers(),
			});

			return {
				success: "User role updated successfully",
				user: result,
			};
		} catch (error) {
			return returnValidationErrors(inputSchema, {
				_errors: ["Failed to update user role. Please try again."],
			});
		}
	});
