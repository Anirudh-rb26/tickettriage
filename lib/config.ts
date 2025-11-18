export const config = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: "gemini-2.0-flash-exp",
  },
  queue: {
    maxConcurrent: 1, // Process one at a time to avoid rate limits
    retryAttempts: 3,
    retryDelay: 1000, // ms
  },
  validation: {
    maxDescriptionLength: 5000,
    minDescriptionLength: 10,
  },
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 20, // 20 requests per minute
  },
  kb: {
    matchThreshold: 0.15, // Minimum confidence to consider a match
    topK: 3, // Return top 3 matches
  },
};
