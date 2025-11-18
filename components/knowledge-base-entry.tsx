import { KnowledgeBaseEntry } from "@/lib/type";
import { Card, CardContent, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import SeverityBadge from "./severity-badge";

const KBEntryCard = ({ entry }: { entry: KnowledgeBaseEntry }) => (
    <Card className="hover:shadow-lg hover:border-primary/50 transition-all h-full flex flex-col">
        <CardContent className="pt-6 space-y-4 flex-1 flex flex-col">
            <div className="flex flex-col justify-between items-start gap-3">
                <Badge variant="outline" className="font-mono text-xs shrink-0">
                    {entry.id}
                </Badge>
                <div className="flex gap-2 flex-row justify-end">
                    <Badge variant="secondary" className="text-xs">
                        {entry.category}
                    </Badge>
                    <SeverityBadge severity={entry.severity} />
                </div>
            </div>

            <CardTitle className="text-lg leading-tight shrink-0">
                {entry.title}
            </CardTitle>

            <div className="space-y-2 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Symptoms
                </div>
                <div className="text-sm leading-relaxed">
                    {entry.symptoms.join(', ')}
                </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mt-auto">
                <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-2">
                    Recommended Action
                </div>
                <div className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-200">
                    {entry.recommended_action}
                </div>
            </div>
        </CardContent>
    </Card>
);

export default KBEntryCard;