/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLM } from "./llm-client";
import { AgentContext, TriageResponse } from "../type";
import { searchKnowledgeBase } from "../tools/kb-search";

export async function triageTicket(
  description: string,
  requestId: string
): Promise<TriageResponse> {
  const startTime = Date.now();

  try {
    // Search knowledge base (Tool call)
    const matchedIssues = searchKnowledgeBase(description);

    const context: AgentContext = {
      description,
      matched_issues: matchedIssues,
      request_id: requestId,
    };

    const llmResponse = await callLLM({ description, matchedIssues });

    const response: TriageResponse = {
      request_id: requestId,
      summary: llmResponse.summary,
      category: llmResponse.category as any,
      severity: llmResponse.severity as any,
      status: llmResponse.status,
      matched_issues: matchedIssues,
      suggested_next_step: llmResponse.suggested_next_step,
      processing_time_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    return response;
  } catch (error) {
    console.error("Agent orchestration error:", error);
    throw error;
  }
}
