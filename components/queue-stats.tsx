import React from 'react'
import { QueueStatus } from '@/lib/type';
import { Card, CardContent } from './ui/card';

const QueueStats = ({ stats }: { stats: QueueStatus }) => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className='flex flex-col gap-2'>
            <div className="text-sm font-medium text-muted-foreground">Total</div>
            <Card>
                <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold">{stats.total_requests}</div>
                </CardContent>
            </Card>
        </div>
        <div className='flex flex-col gap-2'>
            <div className="text-sm font-medium text-muted-foreground">Queued</div>
            <Card className="bg-yellow-500/10 border-yellow-500/20">
                <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.queued}</div>
                </CardContent>
            </Card>
        </div>
        <div className='flex flex-col gap-2'>
            <div className="text-sm font-medium text-muted-foreground">Processing</div>
            <Card className="bg-blue-500/10 border-blue-500/20">
                <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.processing}</div>
                </CardContent>
            </Card>
        </div>
        <div className='flex flex-col gap-2'>
            <div className="text-sm font-medium text-muted-foreground">Completed</div>
            <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.completed}</div>
                </CardContent>
            </Card>
        </div>
        <div className='flex flex-col gap-2'>
            <div className="text-sm font-medium text-muted-foreground">Failed</div>
            <Card className="bg-red-500/10 border-red-500/20">
                <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-red-700 dark:text-red-400">{stats.failed}</div>
                </CardContent>
            </Card>
        </div>
    </div>
);

export default QueueStats;