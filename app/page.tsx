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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { KnowledgeBaseEntry, QueueRequest, QueueStatus, TriageResponse, TriageResult } from '@/lib/type';
import Image from 'next/image';

const PostmanImages = [
  "/health.png",
  "/kb.png",
  "/queue.png",
  "/triage.png",
]

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
    <DialogContent className="max-w-[90vw] w-full max-h-[85vh]">
      <DialogHeader>
        <DialogTitle className="text-2xl">
          Knowledge Base
        </DialogTitle>
        <DialogDescription>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} available
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[calc(85vh-180px)] pr-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(entry => (
            <KBEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </ScrollArea>
      <div className="flex justify-end gap-2 pt-4">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

const ImageModal = ({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[90vw] w-full max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Postman API Screenshots
            </DialogTitle>
            <DialogDescription>
              Visual documentation of API endpoints and responses
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(85vh-180px)] pr-4">
            <div className="grid gap-6 md:grid-cols-2">
              {PostmanImages.map((imagePath, index) => (
                <Card
                  key={index}
                  className="overflow-hidden border-2 transition-all duration-200 hover:border-primary hover:shadow-lg cursor-pointer"
                  onClick={() => setFullscreenImage(imagePath)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video bg-muted">
                      <Image
                        width={800}
                        height={600}
                        src={imagePath}
                        alt={`Postman screenshot ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Screenshot {index + 1} of {PostmanImages.length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 z-10"
            onClick={() => setFullscreenImage(null)}
          >
            <span className="sr-only">Close</span>
            ✕
          </Button>
          <Image
            src={fullscreenImage}
            alt="Fullscreen view"
            width={1920}
            height={1080}
            className="max-w-[95vw] max-h-[95vh] object-contain"
          />
        </div>
      )}
    </>
  );
}

// Queue Request Card Component
const QueueRequestCard = ({ request }: { request: QueueRequest }) => {
  const statusColors: Record<string, string> = {
    completed: 'border-green-500/50 bg-green-500/5',
    processing: 'border-blue-500/50 bg-blue-500/5',
    failed: 'border-destructive/50 bg-destructive/5',
    queued: 'border-yellow-500/50 bg-yellow-500/5'
  };

  const badgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: 'default',
    processing: 'secondary',
    failed: 'destructive',
    queued: 'outline'
  };

  return (
    <Card className={`${statusColors[request.status] || statusColors.queued}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-3 gap-2">
          <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
            {request.id}
          </code>
          <Badge variant={badgeVariants[request.status] || 'outline'} className="capitalize">
            {request.status}
          </Badge>
        </div>
        <p className="text-sm mb-2 line-clamp-2">{request.description}</p>
        {request.position && (
          <p className="text-xs text-muted-foreground mt-2">
            Position in queue: <span className="font-medium">{request.position}</span>
          </p>
        )}
        {request.error && (
          <div className="text-xs text-destructive mt-2 p-2 bg-destructive/10 rounded border border-destructive/20">
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
      <DialogContent className="max-w-[90vw] w-full max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Queue Status</DialogTitle>
          <DialogDescription>
            Current status and recent requests
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(85vh-180px)] pr-4">
          <div className="space-y-6">
            <div>
              <QueueStats stats={status} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Requests</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {status.requests.slice(0, 30).map(req => (
                  <QueueRequestCard key={req.id} request={req} />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onClose} variant="outline">
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
  const [showImages, setShowImages] = useState(false);
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        <ActionButtons
          onViewKB={fetchKB}
          onViewQueue={fetchQueue}
          kbCount={kb.length || 15}
          setShowImages={setShowImages}
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

        <ImageModal isOpen={showImages} onClose={() => setShowImages(false)} />

        <QueueStatusModal
          isOpen={showQueue}
          onClose={() => setShowQueue(false)}
          status={queueStatus}
        />
      </div>
    </div>
  );
}