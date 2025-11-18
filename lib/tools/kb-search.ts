import { config } from "../config";
import knowledgeBaseRaw from "@/data/knowledge-base.json";
import { KnowledgeBaseEntry, MatchedIssue } from "../type";

const knowledgeBase = knowledgeBaseRaw as KnowledgeBaseEntry[];

export function searchKnowledgeBase(query: string): MatchedIssue[] {
  const queryLower = query.toLowerCase();
  const queryTokens = tokenize(queryLower);

  const scored = knowledgeBase.map((entry: KnowledgeBaseEntry) => {
    const score = calculateEntryScore(entry, queryLower, queryTokens);
    const normalizedScore = normalizeScore(score);

    return {
      id: entry.id,
      title: entry.title,
      recommended_action: entry.recommended_action,
      confidence: normalizedScore,
    };
  });

  return scored
    .filter((item) => item.confidence >= config.kb.matchThreshold)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, config.kb.topK);
}

/**
 * Calculate relevance score for a knowledge base entry
 */
function calculateEntryScore(
  entry: KnowledgeBaseEntry,
  queryLower: string,
  queryTokens: string[]
): number {
  let score = 0;

  // Exact title match (weight: 15)
  if (entry.title.toLowerCase().includes(queryLower)) {
    score += 15;
  }

  // Title token overlap (weight: 3)
  const titleTokens = tokenize(entry.title.toLowerCase());
  score += calculateTokenOverlap(queryTokens, titleTokens) * 3;

  // Symptom matching (weight: 10 for exact, 2 for token overlap)
  score += calculateSymptomScore(entry.symptoms, queryLower, queryTokens);

  // Category keyword matching (weight: 2)
  score += calculateCategoryScore(entry.category, queryLower);

  return score;
}

/**
 * Calculate score based on symptom matching
 */
function calculateSymptomScore(
  symptoms: string[],
  queryLower: string,
  queryTokens: string[]
): number {
  let score = 0;

  symptoms.forEach((symptom) => {
    const symptomLower = symptom.toLowerCase();

    // Exact symptom match
    if (queryLower.includes(symptomLower) || symptomLower.includes(queryLower)) {
      score += 10;
    }

    // Token overlap with symptoms
    const symptomTokens = tokenize(symptomLower);
    score += calculateTokenOverlap(queryTokens, symptomTokens) * 2;
  });

  return score;
}

/**
 * Calculate score based on category keywords
 */
function calculateCategoryScore(category: string, queryLower: string): number {
  const categoryKeywords: Record<string, string[]> = {
    Billing: ["bill", "payment", "invoice", "subscription", "charge", "refund"],
    Login: ["login", "password", "auth", "signin", "account", "credential"],
    Performance: ["slow", "lag", "performance", "loading", "timeout", "fast"],
    Bug: ["error", "bug", "crash", "broken", "issue", "problem", "fail"],
    "Question/How-To": ["how", "what", "where", "guide", "help", "tutorial"],
  };

  const relevantKeywords = categoryKeywords[category] || [];

  return relevantKeywords.reduce((score, keyword) => {
    return queryLower.includes(keyword) ? score + 2 : score;
  }, 0);
}

/**
 * Normalize score to 0-1 range
 */
function normalizeScore(score: number, maxScore: number = 40): number {
  return Math.min(score / maxScore, 1);
}

/**
 * Tokenize text by removing stopwords and short tokens
 */
function tokenize(text: string): string[] {
  const stopwords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopwords.has(token));
}

/**
 * Calculate Jaccard similarity between two token sets
 */
function calculateTokenOverlap(tokens1: string[], tokens2: string[]): number {
  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Get all knowledge base entries
 */
export function getKnowledgeBase(): KnowledgeBaseEntry[] {
  return knowledgeBase;
}
