import OpenAI from "openai";
import { config } from "../config";
import { LLMResponse, MatchedIssue } from "../type";

interface CallLLMProps {
  description: string;
  matchedIssues: MatchedIssue[];
}

// Gemini
// const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

// Perplexity
const client = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

/**
 * Call LLM with retry logic and exponential backoff
 */
export async function callLLM({ description, matchedIssues }: CallLLMProps): Promise<LLMResponse> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.queue.retryAttempts; attempt++) {
    try {
      return await execLLM({ description, matchedIssues });
    } catch (error) {
      lastError = error as Error;
      console.error(`LLM call attempt ${attempt} failed:`, lastError.message);

      if (attempt < config.queue.retryAttempts) {
        const delay = calculateBackoffDelay(attempt);
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `LLM call failed after ${config.queue.retryAttempts} attempts: ${lastError?.message}`
  );
}

async function execLLM({ description, matchedIssues }: CallLLMProps): Promise<LLMResponse> {
  const prompt = buildPrompt(description, matchedIssues);

  const result = await client.chat.completions.create({
    model: "sonar",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  if (!result.choices[0]?.message?.content) {
    throw new Error("LLM returned empty response");
  }

  return parseResponse(result.choices[0].message.content);
}

/**
 * Build structured prompt for LLM
 */
function buildPrompt(description: string, matchedIssues: MatchedIssue[]): string {
  const matchedIssuesSection = formatMatchedIssues(matchedIssues);

  return `You are an expert support ticket triage agent. Analyze the following support ticket and provide structured classification.

TICKET DESCRIPTION:
${description}

MATCHED KNOWN ISSUES FROM KNOWLEDGE BASE:
${matchedIssuesSection}

YOUR TASK:
Analyze this ticket and extract the following:

1. Summary: Create a clear, concise 1-2 line summary of the issue

2. Category: Classify into EXACTLY ONE of these categories:
   - Billing
   - Login
   - Performance
   - Bug
   - Question/How-To

3. Severity: Assign EXACTLY ONE severity level:
   - Critical: Service completely broken, data loss, security issue
   - High: Major functionality broken, affects many users
   - Medium: Important but workaround exists, affects some users
   - Low: Minor issue, cosmetic, or general question

4. Status: Determine if this is:
   - known_issue: If ANY matched issue has confidence >40% OR symptoms clearly match a known issue
   - new_issue: If no strong matches found OR issue seems distinct from known issues

5. Suggested Next Step: Provide a SPECIFIC, actionable next step:
   - If known_issue: Reference the KB article/action from matched issues
   - If new_issue: Suggest who to escalate to (backend team, billing team, etc.) OR what info to request from user

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no markdown code blocks, no extra text
- Use EXACTLY the category and severity values listed above
- Be specific in suggested_next_step - mention specific teams, KB articles, or actions
- If matched issues exist with >40% confidence, lean toward known_issue

REQUIRED JSON FORMAT:
{
  "summary": "Brief summary here",
  "category": "One of: Billing|Login|Performance|Bug|Question/How-To",
  "severity": "One of: Low|Medium|High|Critical",
  "status": "known_issue or new_issue",
  "suggested_next_step": "Specific actionable step"
}`;
}

/**
 * Format matched issues for prompt
 */
function formatMatchedIssues(matchedIssues: MatchedIssue[]): string {
  if (matchedIssues.length === 0) {
    return "No matching known issues found in knowledge base.";
  }

  return matchedIssues
    .map(
      (issue, idx) =>
        `${idx + 1}. [${issue.id}] ${issue.title}
   Confidence: ${(issue.confidence * 100).toFixed(1)}%
   Recommended Action: ${issue.recommended_action}`
    )
    .join("\n\n");
}

/**
 * Parse LLM response and validate structure
 */
function parseResponse(text: string): LLMResponse {
  const jsonText = extractJSON(text);

  try {
    const parsed = JSON.parse(jsonText);
    validateLLMResponse(parsed);
    return parsed as LLMResponse;
  } catch (error) {
    console.error("Failed to parse LLM response:", text);
    throw new Error(
      `Invalid LLM response format: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Extract JSON from text, removing markdown code blocks if present
 */
function extractJSON(text: string): string {
  const trimmed = text.trim();
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);

  return codeBlockMatch ? codeBlockMatch[1].trim() : trimmed;
}

/**
 * Validate that LLM response contains all required fields
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateLLMResponse(parsed: any): void {
  const requiredFields = ["summary", "category", "severity", "status", "suggested_next_step"];
  const missingFields = requiredFields.filter((field) => !parsed[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(attempt: number): number {
  return config.queue.retryDelay * Math.pow(2, attempt - 1);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
