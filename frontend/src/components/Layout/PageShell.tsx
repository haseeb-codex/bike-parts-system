import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageShell({ title, description, actions, children, className }: PageShellProps) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8', className)}>
      <div className="mb-5 flex flex-col gap-3 rounded-xl border bg-card/80 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/70 sm:mb-6 sm:p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
