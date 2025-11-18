import { QueuedRequest, QueueStatus } from "../type";

class QueueManager {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private activeProcessing = 0;
  private readonly maxConcurrent: number;

  constructor(maxConcurrent: number = 1) {
    this.maxConcurrent = maxConcurrent;
  }

  async enqueue(description: string): Promise<string> {
    const id = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const request: QueuedRequest = {
      id,
      description,
      timestamp: Date.now(),
      status: "queued",
      position: this.getQueuedCount() + 1,
    };

    this.queue.push(request);

    if (!this.processing) {
      this.processQueue();
    }

    return id;
  }

  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.hasQueuedRequests()) {
      if (this.activeProcessing >= this.maxConcurrent) {
        await this.sleep(100);
        continue;
      }

      const nextRequest = this.getNextQueuedRequest();
      if (!nextRequest) break;

      nextRequest.status = "processing";
      this.activeProcessing++;
      this.updateQueuePositions();

      // Processing happens in the triage route, this just manages state
      await this.sleep(50);
    }

    this.processing = false;
  }

  private updateQueuePositions(): void {
    this.getQueuedRequests().forEach((req, idx) => {
      req.position = idx + 1;
    });
  }

  getRequest(id: string): QueuedRequest | undefined {
    return this.queue.find((r) => r.id === id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  completeRequest(id: string, result: any): void {
    const request = this.getRequest(id);
    if (!request) return;

    request.status = "completed";
    request.result = result;
    this.decrementActiveProcessing();
    this.processQueue();
  }

  failRequest(id: string, error: string): void {
    const request = this.getRequest(id);
    if (!request) return;

    request.status = "failed";
    request.error = error;
    this.decrementActiveProcessing();
    this.processQueue();
  }

  getStatus(): QueueStatus {
    return {
      total_requests: this.queue.length,
      queued: this.getQueuedCount(),
      processing: this.getRequestsByStatus("processing").length,
      completed: this.getRequestsByStatus("completed").length,
      failed: this.getRequestsByStatus("failed").length,
      requests: this.getRecentRequests(50),
    };
  }

  cleanup(): void {
    if (this.queue.length <= 100) return;

    const sorted = [...this.queue].sort((a, b) => b.timestamp - a.timestamp);
    this.queue = sorted.slice(0, 100);
  }

  // Helper methods
  private hasQueuedRequests(): boolean {
    return this.queue.some((r) => r.status === "queued");
  }

  private getQueuedRequests(): QueuedRequest[] {
    return this.queue.filter((r) => r.status === "queued");
  }

  private getQueuedCount(): number {
    return this.getQueuedRequests().length;
  }

  private getNextQueuedRequest(): QueuedRequest | undefined {
    return this.queue.find((r) => r.status === "queued");
  }

  private getRequestsByStatus(status: QueuedRequest["status"]): QueuedRequest[] {
    return this.queue.filter((r) => r.status === status);
  }

  private getRecentRequests(limit: number): QueuedRequest[] {
    return [...this.queue].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  private decrementActiveProcessing(): void {
    this.activeProcessing = Math.max(0, this.activeProcessing - 1);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const queueManager = new QueueManager();

// Cleanup every 5 minutes (server-side only)
if (typeof window === "undefined") {
  setInterval(() => queueManager.cleanup(), 5 * 60 * 1000);
}
