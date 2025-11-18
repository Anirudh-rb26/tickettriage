import { NextResponse } from "next/server";
import { getKnowledgeBase } from "@/lib/tools/kb-search";

export async function GET() {
  try {
    const kb = getKnowledgeBase();

    return NextResponse.json({
      total: kb.length,
      entries: kb,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("KB retrieval error:", error);
    return NextResponse.json({ error: "Failed to retrieve knowledge base" }, { status: 500 });
  }
}
