import React from 'react'
import { Badge } from './ui/badge';
import { MatchedIssue } from '@/lib/type';

const MatchedIssueCard = ({ issue }: { issue: MatchedIssue }) => (
    <div className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
        <div className="flex justify-between items-start mb-2">
            <div className="font-semibold">{issue.title}</div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                {(issue.confidence * 100).toFixed(0)}% match
            </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
            <strong>Recommended Action:</strong> {issue.recommended_action}
        </div>
    </div>
);

export default MatchedIssueCard