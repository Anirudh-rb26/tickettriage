import { NextResponse } from "next/server";
import { queueManager } from "@/lib/tools/queue-manager";

export async function GET() {
  try {
    const status = queueManager.getStatus();

    return NextResponse.json({
      ...status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Queue status error:", error);
    return NextResponse.json({ error: "Failed to get queue status" }, { status: 500 });
  }
}
