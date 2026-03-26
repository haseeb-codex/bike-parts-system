import { Activity, Factory, ShoppingBag } from 'lucide-react';

import type { ActivityItem } from '@/hooks/useDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ActivityFeedProps {
  items: ActivityItem[];
}

function getActivityIcon(type: ActivityItem['type']) {
  return type === 'production' ? Factory : ShoppingBag;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const Icon = getActivityIcon(item.type);
          return (
            <div key={item.id} className="rounded-lg border bg-background/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-md bg-secondary p-1.5 text-secondary-foreground">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="whitespace-nowrap">
                  {item.amountLabel}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{formatTime(item.timestamp)}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
