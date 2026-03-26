import { type LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendType?: 'success' | 'warning' | 'secondary';
  icon: LucideIcon;
  description: string;
}

export function StatCard({
  title,
  value,
  trend,
  trendType = 'secondary',
  icon: Icon,
  description,
}: StatCardProps) {
  return (
    <Card className="transition-transform duration-200 hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
        </div>
        <div className="rounded-md bg-secondary p-2 text-secondary-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-2">
        <Badge variant={trendType}>{trend}</Badge>
        <span className="text-xs text-muted-foreground">{description}</span>
      </CardContent>
    </Card>
  );
}
