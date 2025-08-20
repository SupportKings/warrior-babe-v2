"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const schema = z.object({
	product_ids: z.array(z.string().uuid()).optional(),
});

export const recalculateAllClients = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();
		
		try {
			// Get all active clients
			let query = supabase
				.from("clients")
				.select("id")
				.eq("status", "active");

			// Filter by product IDs if provided
			if (parsedInput.product_ids && parsedInput.product_ids.length > 0) {
				query = query.in("product_id", parsedInput.product_ids);
			}

			const { data: clients, error: clientsError } = await query;

			if (clientsError) {
				console.error("Error fetching clients:", clientsError);
				throw new Error("Failed to fetch clients for recalculation");
			}

			if (!clients || clients.length === 0) {
				return {
					success: true,
					message: "No active clients found to recalculate",
					clients_processed: 0,
				};
			}

			// Trigger recalculation for each client using the existing API endpoint
			// Handle different environment setups
			let baseUrl: string;
			
			if (process.env.NEXT_PUBLIC_VERCEL_URL) {
				// In production Vercel or if NEXT_PUBLIC_VERCEL_URL is set
				if (process.env.NEXT_PUBLIC_VERCEL_URL.startsWith('localhost')) {
					// Development setup
					baseUrl = `http://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
				} else {
					// Production Vercel
					baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
				}
			} else {
				// Fallback to other env vars or default
				baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
			}
			
			const recalculationPromises = clients.map(async (client) => {
				try {
					const response = await fetch(`${baseUrl}/api/client-unit`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ client_id: client.id }),
					});

					if (!response.ok) {
						console.error(`Failed to recalculate client ${client.id}:`, response.statusText);
						return { client_id: client.id, success: false, error: response.statusText };
					}

					const result = await response.json();
					return { client_id: client.id, success: true, result };
				} catch (error) {
					console.error(`Error recalculating client ${client.id}:`, error);
					return { 
						client_id: client.id, 
						success: false, 
						error: error instanceof Error ? error.message : "Unknown error" 
					};
				}
			});

			// Process recalculations in batches to avoid overwhelming the system
			const batchSize = 10;
			const results = [];
			
			for (let i = 0; i < recalculationPromises.length; i += batchSize) {
				const batch = recalculationPromises.slice(i, i + batchSize);
				const batchResults = await Promise.all(batch);
				results.push(...batchResults);
				
				// Small delay between batches
				if (i + batchSize < recalculationPromises.length) {
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			}

			const successful = results.filter(r => r.success).length;
			const failed = results.filter(r => !r.success).length;

			return {
				success: true,
				message: `Recalculated ${successful} clients successfully${failed > 0 ? `, ${failed} failed` : ""}`,
				clients_processed: successful,
				clients_failed: failed,
				results: results,
			};
		} catch (error) {
			console.error("Error in recalculateAllClients:", error);
			throw new Error(
				error instanceof Error 
					? error.message 
					: "Failed to recalculate client units"
			);
		}
	});