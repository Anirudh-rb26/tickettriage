import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "support-ticket-triage-agent",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    gemini_configured: !!process.env.GEMINI_API_KEY,
  });
}
