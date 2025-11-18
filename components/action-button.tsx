import React from 'react'
import { Button } from './ui/button';

const ActionButtons = ({
    onViewKB,
    onViewQueue,
    kbCount
}: {
    onViewKB: () => void;
    onViewQueue: () => void;
    kbCount: number;
}) => (
    <div className="flex flex-wrap gap-3 mb-8">
        <Button
            onClick={onViewKB}
            size="lg"
            variant="outline"
            className="font-medium"
        >
            <span className="mr-2">📚</span>
            View Knowledge Base ({kbCount})
        </Button>
        <Button
            onClick={onViewQueue}
            size="lg"
            variant="outline"
            className="font-medium"
        >
            <span className="mr-2">🔄</span>
            Queue Status
        </Button>
    </div>
);

export default ActionButtons