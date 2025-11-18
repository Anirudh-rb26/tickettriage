import React from 'react'
import { Button } from './ui/button';

const TestMessageItem = ({
    message,
    index,
    onTriage,
    isLoading
}: {
    message: string;
    index: number;
    onTriage: () => void;
    isLoading: boolean;
}) => (
    <div className="flex gap-4 items-start p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <div className="flex-1 text-sm leading-relaxed">{message}</div>
        <Button
            onClick={onTriage}
            disabled={isLoading}
            size="sm"
            className="shrink-0"
        >
            {isLoading ? (
                <>
                    <span className="mr-2">⏳</span>
                    Processing...
                </>
            ) : (
                <>
                    <span className="mr-2">🎯</span>
                    Triage
                </>
            )}
        </Button>
    </div>
);

export default TestMessageItem;