import React from 'react'
import { Badge } from './ui/badge';

const SeverityBadge = ({ severity }: { severity: string }) => {
    const variants: Record<string, string> = {
        Critical: 'bg-destructive text-destructive-foreground',
        High: 'bg-orange-500 text-white',
        Medium: 'bg-yellow-500 text-white',
        Low: 'bg-green-500 text-white'
    };

    return (
        <Badge className={variants[severity] || ''}>
            {severity}
        </Badge>
    );
};

export default SeverityBadge;