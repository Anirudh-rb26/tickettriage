// Request/Response types
export interface TriageRequest {
  description: string;
}

export interface TriageResponse {
  request_id: string;
  summary: string;
  category: "Billing" | "Login" | "Performance" | "Bug" | "Question/How-To";
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "known_issue" | "new_issue";
  matched_issues: MatchedIssue[];
  suggested_next_step: string;
  processing_time_ms: number;
  timestamp: string;
}

// Knowledge Base types
export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  category: "Billing" | "Login" | "Performance" | "Bug" | "Question/How-To";
  severity: "Low" | "Medium" | "High" | "Critical";
  symptoms: string[];
  recommended_action: string;
}

export interface MatchedIssue {
  id: string;
  title: string;
  confidence: number;
  recommended_action: string;
}

// Queue types
export interface QueuedRequest {
  id: string;
  description: string;
  timestamp: number;
  status: "queued" | "processing" | "completed" | "failed";
  position?: number;
  result?: TriageResponse;
  error?: string;
}

export interface QueueStatus {
  total_requests: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  requests: QueuedRequest[];
}

// Agent internal types
export interface AgentContext {
  description: string;
  matched_issues: MatchedIssue[];
  request_id: string;
}

export interface LLMResponse {
  summary: string;
  category: string;
  severity: string;
  status: "known_issue" | "new_issue";
  suggested_next_step: string;
}

export interface QueueRequest {
  id: string;
  description: string;
  status: string;
  position?: number;
  error?: string;
}

export interface TriageResult {
  description: string;
  result: TriageResponse;
  error?: string;
}
