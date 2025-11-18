import { config } from "@/lib/config";
import { triageTicket } from "@/lib/agent/orchestrator";
import { NextRequest, NextResponse } from "next/server";
import { queueManager } from "@/lib/tools/queue-manager";
import { TriageRequest } from "@/lib/type";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.rateLimit.windowMs,
    });
    return true;
  }

  if (limit.count >= config.rateLimit.maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Maximum ${config.rateLimit.maxRequests} requests per minute`,
        },
        { status: 429 }
      );
    }

    // Parse request
    const body: TriageRequest = await request.json();

    // Validation
    if (!body.description || typeof body.description !== "string") {
      return NextResponse.json(
        { error: "Validation failed", message: "description is required and must be a string" },
        { status: 400 }
      );
    }

    const trimmed = body.description.trim();

    if (trimmed.length < config.validation.minDescriptionLength) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: `Description must be at least ${config.validation.minDescriptionLength} characters`,
        },
        { status: 400 }
      );
    }

    if (trimmed.length > config.validation.maxDescriptionLength) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: `Description too long (max ${config.validation.maxDescriptionLength} characters)`,
        },
        { status: 400 }
      );
    }

    // Enqueue request
    const requestId = await queueManager.enqueue(trimmed);

    try {
      // Process with agent orchestrator
      const result = await triageTicket(trimmed, requestId);

      // Mark as completed
      queueManager.completeRequest(requestId, result);

      return NextResponse.json(result);
    } catch (agentError) {
      // Mark as failed
      const errorMessage = agentError instanceof Error ? agentError.message : "Unknown error";
      queueManager.failRequest(requestId, errorMessage);

      return NextResponse.json(
        {
          error: "Triage processing failed",
          message: errorMessage,
          request_id: requestId,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Triage endpoint error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Cleanup rate limit map periodically
if (typeof window === "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, config.rateLimit.windowMs);
}
