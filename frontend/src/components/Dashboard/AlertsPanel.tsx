import { AlertTriangle, BellRing } from 'lucide-react';

import type { AlertItem } from '@/hooks/useDashboardData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AlertsPanelProps {
  alerts: AlertItem[];
}

function getAlertVariant(severity: AlertItem['severity']) {
  if (severity === 'high') return 'warning';
  if (severity === 'medium') return 'warning';
  return 'secondary';
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BellRing className="h-4 w-4" />
          Notifications & Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-lg border bg-background/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </div>
              <Badge variant={getAlertVariant(alert.severity)}>{alert.severity}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
