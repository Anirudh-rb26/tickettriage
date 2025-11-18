"use client"

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import QueueStats from '@/components/queue-stats';
import ActionButtons from '@/components/action-button';
import TriageResults from '@/components/triage-results';
import TestMessageItem from '@/components/test-message';
import KBEntryCard from '@/components/knowledge-base-entry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KnowledgeBaseEntry, QueueRequest, QueueStatus, TriageResponse, TriageResult } from '@/lib/type';


// Test Messages Component
const TestMessages = ({
  messages,
  onTriage,
  loadingIndex
}: {
  messages: string[];
  onTriage: (msg: string, idx: number) => void;
  loadingIndex: string | null;
}) => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="text-2xl">Test Messages</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {messages.map((msg, idx) => (
        <TestMessageItem
          key={idx}
          message={msg}
          index={idx}
          onTriage={() => onTriage(msg, idx)}
          isLoading={loadingIndex === `msg-${idx}`}
        />
      ))}
    </CardContent>
  </Card>
);

const KnowledgeBaseModal = ({
  isOpen,
  onClose,
  entries
}: {
  isOpen: boolean;
  onClose: () => void;
  entries: KnowledgeBaseEntry[];
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-[96vw] w-full max-h-[92vh] overflow-hidden flex flex-col gap-0 p-0">
      <DialogHeader className="px-8 pt-8 pb-6 border-b">
        <DialogTitle className="text-3xl font-semibold">
          Knowledge Base
          <span className="text-muted-foreground text-xl font-normal ml-3">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </DialogTitle>
      </DialogHeader>
      <div className="overflow-y-auto flex-1 px-8 py-6">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {entries.map(entry => (
            <KBEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
      <div className="flex justify-end px-8 py-6 border-t bg-muted/30">
        <Button onClick={onClose} variant="outline" size="lg">
          Close
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);


// Queue Request Card Component
const QueueRequestCard = ({ request }: { request: QueueRequest }) => {
  const statusColors: Record<string, string> = {
    completed: 'bg-green-500/10 border-green-500/20',
    processing: 'bg-blue-500/10 border-blue-500/20',
    failed: 'bg-red-500/10 border-red-500/20',
    queued: 'bg-yellow-500/10 border-yellow-500/20'
  };

  const badgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: 'default',
    processing: 'secondary',
    failed: 'destructive',
    queued: 'outline'
  };

  return (
    <Card className={`${statusColors[request.status] || statusColors.queued} border-2`}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3 gap-2">
          <code className="text-xs font-mono text-muted-foreground px-2 py-1 bg-muted rounded">
            {request.id}
          </code>
          <Badge variant={badgeVariants[request.status] || 'outline'} className="capitalize">
            {request.status}
          </Badge>
        </div>
        <div className="text-sm mb-2 line-clamp-2">{request.description}</div>
        {request.position && (
          <div className="text-xs text-muted-foreground mt-2">
            Position in queue: <span className="font-medium">{request.position}</span>
          </div>
        )}
        {request.error && (
          <div className="text-xs text-destructive mt-2 p-2 bg-destructive/10 rounded">
            {request.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Queue Status Modal Component
const QueueStatusModal = ({
  isOpen,
  onClose,
  status
}: {
  isOpen: boolean;
  onClose: () => void;
  status: QueueStatus | null;
}) => {
  if (!status) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[96vw] w-full max-h-[92vh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="px-8 pt-8 pb-6 border-b">
          <DialogTitle className="text-3xl font-semibold">Queue Status</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-8 py-6">
          <div className="mb-8">
            <QueueStats stats={status} />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Recent Requests</h3>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {status.requests.slice(0, 30).map(req => (
                <QueueRequestCard key={req.id} request={req} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end px-8 py-6 border-t bg-muted/30">
          <Button onClick={onClose} variant="outline" size="lg">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
export default function Home() {
  const [showKB, setShowKB] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [kb, setKB] = useState<KnowledgeBaseEntry[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [triageResults, setTriageResults] = useState<TriageResult[]>([]);

  const testMessages = [
    "Checkout keeps failing with error 500 on mobile Safari. Tried multiple times but payment won't go through.",
    "I can't login after resetting my password. It just times out every time I try. Very frustrating!",
    "The dashboard is super slow to load. Takes like 30 seconds on initial visit. Is this normal?",
    "How do I integrate your service with Zapier? Need step-by-step instructions please.",
    "My invoice won't download as PDF when I click the button. Just shows a blank page.",
    "Not receiving SMS codes for two-factor authentication. Checked my phone number and it's correct.",
    "Getting rate limit error 429 when calling your API. What are the current limits?",
  ];

  const fetchKB = async () => {
    try {
      const res = await fetch('/api/kb');
      const data = await res.json();
      setKB(data.entries);
      setShowKB(true);
    } catch (error) {
      alert(`Failed to load knowledge base: ${error}`);
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      setQueueStatus(data);
      setShowQueue(true);
    } catch (error) {
      alert(`Failed to load queue status: ${error}`);
    }
  };

  const triageTicket = async (description: string, index: number) => {
    setLoading(`msg-${index}`);

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      const result = await res.json();

      if (res.ok) {
        setTriageResults(prev => [...prev, { description, result }]);
      } else {
        setTriageResults(prev => [...prev, {
          description,
          result: {} as TriageResponse,
          error: result.message || result.error
        }]);
      }
    } catch (error) {
      setTriageResults(prev => [...prev, {
        description,
        result: {} as TriageResponse,
        error: 'Network error'
      }]);
      console.error("Triage Error: ", error);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    if (!showQueue) return;
    const interval = setInterval(fetchQueue, 2000);
    return () => clearInterval(interval);
  }, [showQueue]);

  return (
    <div className="w-9xl min-h-screen">
      <div className="mx-auto p-8">
        <ActionButtons
          onViewKB={fetchKB}
          onViewQueue={fetchQueue}
          kbCount={kb.length || 15}
        />
        <TestMessages
          messages={testMessages}
          onTriage={triageTicket}
          loadingIndex={loading}
        />
        <TriageResults results={triageResults} />

        <KnowledgeBaseModal
          isOpen={showKB}
          onClose={() => setShowKB(false)}
          entries={kb}
        />
        <QueueStatusModal
          isOpen={showQueue}
          onClose={() => setShowQueue(false)}
          status={queueStatus}
        />
      </div>
    </div>
  );
}