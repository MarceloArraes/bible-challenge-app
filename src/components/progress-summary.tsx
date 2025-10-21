"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Stats } from "@/hooks/use-bible-challenge";
import { Target, CalendarCheck, Percent } from 'lucide-react';

interface ProgressSummaryProps {
  stats: Stats;
}

export default function ProgressSummary({ stats }: ProgressSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Target className="h-6 w-6" />
            Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Percent className="h-4 w-4" /> Completion</span>
            <span className="font-mono font-semibold text-foreground">{stats.percentComplete.toFixed(1)}%</span>
          </div>
          <Progress value={stats.percentComplete} />
        </div>
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CalendarCheck className="h-4 w-4" /> Est. Finish Date</span>
                <span className="font-mono font-semibold text-foreground">
                    {stats.estimatedEndDate.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}
                </span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
