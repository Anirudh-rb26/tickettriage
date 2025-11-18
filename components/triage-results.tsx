
import { TriageResult } from '@/lib/type';
import TriageResultCard from './triage-result-card';
import { Card, CardContent, CardDescription, CardTitle } from './ui/card';

const TriageResults = ({ results }: { results: TriageResult[] }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Triage Results</h2>
        {results.length === 0 ? (
            <Card>
                <CardContent className="p-12 text-center">
                    <div className="text-6xl mb-4">🎫</div>
                    <CardTitle className="mb-2">No tickets triaged yet</CardTitle>
                    <CardDescription>Click a &quotTriage&quot button above to start analyzing support tickets</CardDescription>
                </CardContent>
            </Card>
        ) : (
            results.map((item, idx) => <TriageResultCard key={idx} item={item} />)
        )}
    </div>
);

export default TriageResults;