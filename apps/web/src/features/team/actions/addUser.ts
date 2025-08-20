"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { rolesMap } from "@/lib/permissions";
import { actionClient } from "@/lib/safe-action";

import { siteConfig } from "@/siteConfig";

import { InviteEmail } from "@workspace/emails/emails/invite";
import { returnValidationErrors } from "next-safe-action";
import { Resend } from "resend";
import { z } from "zod";

// Create type for all available roles
type RoleType = keyof typeof rolesMap;

const inputSchema = z.object({
	email: z.string().email("Invalid email address"),
	name: z.string().min(2, "Name must be at least 2 characters"),
	role: z.enum(Object.keys(rolesMap) as [RoleType, ...RoleType[]]),
});

// Generate a secure random password
function generateSecurePassword(): string {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
	let password = "";
	for (let i = 0; i < 12; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const addUser = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput: { email, name, role } }) => {
		try {
			// Get current user (inviter)
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(inputSchema, {
					_errors: ["You must be logged in to invite users."],
				});
			}

			const inviterName = session.user.name;
			const inviterEmail = session.user.email;

			// Generate invite URL
			const inviteUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

			// 1. Create the user first
			const password = generateSecurePassword();
			
			const newUser = await auth.api.createUser({
				body: {
					email,
					password,
					name,
					role,
				},
			}).catch(async (createUserError: unknown) => {
				// Check if user already exists - Better Auth throws APIError with status BAD_REQUEST
				if (createUserError && typeof createUserError === 'object' && 'status' in createUserError) {
					const apiError = createUserError as { status: string; body?: any };
					
					// Check if it's a BAD_REQUEST and contains "User already exists" message
					if (apiError.status === 'BAD_REQUEST') {
						const errorMessage = apiError.body?.message || '';
						if (errorMessage.toLowerCase().includes('user already exists') || 
							errorMessage.toLowerCase().includes('already exists')) {
							// User exists - check if they're banned and unban them
							try {
								// Search for user by email
								const searchResult = await auth.api.listUsers({
									query: {
										searchValue: email,
										searchField: "email",
									},
									headers: await headers(),
								});
								
								const existingUser = searchResult.users?.find(u => u.email === email);
								
								if (existingUser) {
									// If user is banned, unban them
									if (existingUser.banned) {
										await auth.api.unbanUser({
											body: {
												userId: existingUser.id,
											},
											headers: await headers(),
										});
										
										// Update their role if needed
										if (existingUser.role !== role) {
											await auth.api.setRole({
												body: {
													userId: existingUser.id,
													role,
												},
												headers: await headers(),
											});
										}
										
										return existingUser;
									}
								}
							} catch (unbanError) {
								console.error("Error checking/unbanning user:", unbanError);
							}
							
							throw new Error("USER_ALREADY_EXISTS");
						}
					}
				}
				
				console.error("Error creating user:", createUserError);
				throw new Error("CREATE_USER_FAILED");
			});

			// 2. Send invite email after successful user creation
			try {
				const { error } = await resend.emails.send({
					from: "Warrior Babe <support@send.warriorbabe.com>",
					to: [email],
					subject: `You've been invited to join ${siteConfig.name}`,
					react: InviteEmail({
						inviteUrl,
						companyName: siteConfig.name,
						inviterName,
						inviterEmail,
						role: role.charAt(0).toUpperCase() + role.slice(1),
					}),
				});

				if (error) {
					console.error("Error sending invite email:", error);
					// Note: User was created successfully, but email failed
					// You might want to handle this differently (e.g., retry email later)
					return returnValidationErrors(inputSchema, {
						_errors: ["User created but failed to send invite email. Please try again."],
					});
				}
			} catch (emailError) {
				console.error("Error sending invite email:", emailError);
				// Note: User was created successfully, but email failed
				return returnValidationErrors(inputSchema, {
					_errors: ["User created but failed to send invite email. Please try again."],
				});
			}

			return {
				success: "User invited successfully",
				user: newUser,
			};
		} catch (error) {
			console.error("Unexpected error in addUser:", error);
			
			// Handle specific error types
			if (error instanceof Error) {
				if (error.message === "USER_ALREADY_EXISTS") {
					return returnValidationErrors(inputSchema, {
						_errors: ["A user with this email already exists."],
					});
				}
				if (error.message === "CREATE_USER_FAILED") {
					return returnValidationErrors(inputSchema, {
						_errors: ["Failed to create user. Please try again."],
					});
				}
			}
			
			return returnValidationErrors(inputSchema, {
				_errors: ["Failed to create user. Please try again."],
			});
		}
	});
