import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
          <CardDescription>
            Your account does not have the required access for this route.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button asChild>
            <Link to="/">Back to dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">Sign in with another account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
