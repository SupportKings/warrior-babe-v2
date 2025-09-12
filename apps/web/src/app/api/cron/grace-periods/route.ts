import { detectAndCreateGracePeriods } from "@/features/client_activity_period/services/detectGracePeriods";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		// Verify that this is a legitimate cron request from Vercel
		const authHeader = request.headers.get("authorization");
		
		// In production, you should verify the cron secret
		// const cronSecret = process.env.CRON_SECRET;
		// if (authHeader !== `Bearer ${cronSecret}`) {
		//   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		// }

		console.log("🕒 Cron job started: Grace period detection");

		const result = await detectAndCreateGracePeriods();

		console.log("✅ Cron job completed successfully:", result.data);

		return NextResponse.json({
			success: true,
			message: "Grace period detection completed",
			data: result.data,
			timestamp: new Date().toISOString(),
		});

	} catch (error) {
		console.error("❌ Cron job failed:", error);

		return NextResponse.json({
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
			timestamp: new Date().toISOString(),
		}, { status: 500 });
	}
}

// Allow GET for manual testing
export async function GET() {
	try {
		console.log("🔧 Manual grace period detection triggered");

		const result = await detectAndCreateGracePeriods();

		return NextResponse.json({
			success: true,
			message: "Grace period detection completed (manual trigger)",
			data: result.data,
			timestamp: new Date().toISOString(),
		});

	} catch (error) {
		console.error("❌ Manual grace period detection failed:", error);

		return NextResponse.json({
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
			timestamp: new Date().toISOString(),
		}, { status: 500 });
	}
}