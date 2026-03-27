import { PageShell } from '@/components/Layout/PageShell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export default function AccountSettingsPage() {
  const { user } = useAuth();

  return (
    <PageShell
      title="Account Settings"
      description="Review your login profile and account details for this workspace."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Details from your authenticated account session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
              <p className="text-sm font-medium text-foreground">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
              <Badge variant="secondary" className="mt-1">
                {user?.role || 'employee'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Placeholder settings panel for profile preferences and notification options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="display-name">
                Display Name
              </label>
              <Input id="display-name" value={user?.name || ''} readOnly />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="account-email">
                Account Email
              </label>
              <Input id="account-email" value={user?.email || ''} readOnly />
            </div>
            <p className="text-xs text-muted-foreground">
              Editable profile settings can be connected here once a profile update API is exposed.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
