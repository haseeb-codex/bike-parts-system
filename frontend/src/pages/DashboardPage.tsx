import { ArrowUpRight, Factory, Package, ShoppingCart, Users2 } from 'lucide-react';

import { StatCard } from '@/components/Dashboard/StatCard';
import { PageShell } from '@/components/Layout/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  return (
    <PageShell
      title="Operations Dashboard"
      description="Track production, inventory, and workforce metrics with reusable UI building blocks."
      actions={
        <>
          <Input className="w-[220px]" placeholder="Search transactions..." />
          <Button>
            View Reports
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Daily Production"
          value="1,248 units"
          trend="+12.6%"
          trendType="success"
          icon={Factory}
          description="vs yesterday"
        />
        <StatCard
          title="Inventory Health"
          value="96.2%"
          trend="Stable"
          trendType="secondary"
          icon={Package}
          description="fill ratio"
        />
        <StatCard
          title="Sales Orders"
          value="182"
          trend="+8.1%"
          trendType="success"
          icon={ShoppingCart}
          description="today"
        />
        <StatCard
          title="Attendance"
          value="87/92"
          trend="2 absent"
          trendType="warning"
          icon={Users2}
          description="current shift"
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Reusable UI System Baseline</CardTitle>
          <CardDescription>
            New screens can compose `PageShell`, `Card`, `Button`, `Input`, and domain widgets for
            consistent delivery.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            This dashboard demonstrates the structure for scalable features: a page shell, shared
            primitives, and feature-focused components.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
