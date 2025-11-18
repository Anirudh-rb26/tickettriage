import React, { Dispatch, SetStateAction } from 'react'
import { Button } from './ui/button';
import { Image } from 'lucide-react';

const ActionButtons = ({
    onViewKB,
    onViewQueue,
    kbCount,
    setShowImages,
}: {
    onViewKB: () => void;
    onViewQueue: () => void;
    kbCount: number;
    setShowImages: Dispatch<SetStateAction<boolean>>
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
        <Button
            onClick={() => setShowImages(true)}
            size="lg"
            variant="outline"
            className="font-medium"
        >
            <Image />
            Show Images
        </Button>
    </div>
);

export default ActionButtons