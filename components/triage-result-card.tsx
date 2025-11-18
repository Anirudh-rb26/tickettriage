import React from 'react'
import { Badge } from './ui/badge';
import SeverityBadge from './severity-badge';
import { Card, CardContent } from './ui/card';
import MatchedIssueCard from './matched-issue-card';
import { Alert, AlertDescription } from './ui/alert';
import { TriageResult } from '@/lib/type';

const TriageResultCard = ({ item }: { item: TriageResult }) => (
    <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
            {/* Original Ticket */}
            <div className="mb-6 p-4 rounded-lg bg-muted/50 border">
                <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Original Ticket</div>
                <div className="leading-relaxed italic">{item.description}</div>
            </div>

            {item.error ? (
                <Alert variant="destructive">
                    <AlertDescription>
                        <strong>Error:</strong> {item.error}
                    </AlertDescription>
                </Alert>
            ) : (
                <>
                    {/* Summary */}
                    <div className="mb-6">
                        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Summary</div>
                        <div className="text-lg font-medium">{item.result.summary}</div>
                    </div>

                    {/* Classification Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Category</div>
                            <Badge variant="secondary">
                                {item.result.category}
                            </Badge>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Severity</div>
                            <SeverityBadge severity={item.result.severity} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Status</div>
                            <Badge variant={item.result.status === 'known_issue' ? 'default' : 'outline'}>
                                {item.result.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Request ID</div>
                            <span className="text-xs font-mono text-muted-foreground">{item.result.request_id}</span>
                        </div>
                    </div>

                    {/* Matched Issues */}
                    {item.result.matched_issues && item.result.matched_issues.length > 0 && (
                        <div className="mb-6">
                            <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Matched Known Issues</div>
                            <div className="space-y-3">
                                {item.result.matched_issues.map(mi => (
                                    <MatchedIssueCard key={mi.id} issue={mi} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggested Next Step */}
                    <div className="p-4 rounded-lg border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20 mb-4">
                        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Suggested Next Step</div>
                        <div className="font-medium">{item.result.suggested_next_step}</div>
                    </div>

                    {/* Metadata */}
                    <div className="flex justify-between text-xs text-muted-foreground pt-4 border-t">
                        <span>Processed in {item.result.processing_time_ms}ms</span>
                        <span>{new Date(item.result.timestamp).toLocaleString()}</span>
                    </div>
                </>
            )}
        </CardContent>
    </Card>
);

export default TriageResultCard;