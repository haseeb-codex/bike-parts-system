import {
  Boxes,
  Cog,
  Factory,
  FileBarChart2,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingCart,
  Users2,
  Wrench,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  roles?: Array<'admin' | 'manager' | 'operator'>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: Boxes },
  { label: 'Materials', path: '/materials', icon: Package },
  { label: 'Production', path: '/production', icon: Factory },
  { label: 'Inventory', path: '/inventory', icon: FileBarChart2 },
  { label: 'Sales', path: '/sales', icon: ShoppingCart },
  { label: 'Employees', path: '/employees', icon: Users2, roles: ['admin', 'manager'] },
  { label: 'Financial', path: '/financial', icon: FileBarChart2, roles: ['admin', 'manager'] },
  { label: 'Utilities', path: '/utilities', icon: Wrench, roles: ['admin'] },
  { label: 'Account Settings', path: '/account', icon: Cog },
];

export function Sidebar({ mobileOpen, collapsed, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const { user } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles || !user?.role) {
      return true;
    }

    return item.roles.includes(user.role);
  });

  return (
    <>
      {mobileOpen ? (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={onCloseMobile}
          type="button"
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 overflow-x-hidden border-r border-border/80 bg-card/90 backdrop-blur-md transition-all duration-300',
          collapsed ? 'w-20' : 'w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          <div
            className={
              collapsed
                ? 'relative border-b border-border/70 px-3 py-5'
                : 'relative border-b border-border/70 px-5 py-5'
            }
          >
            <div
              className={
                collapsed ? 'grid place-items-center' : 'flex items-start justify-between gap-3'
              }
            >
              {collapsed ? (
                <div className="grid place-items-center rounded-lg bg-primary/10 py-2">
                  <span className="text-lg font-bold text-primary">BP</span>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Bike Parts System
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-foreground">
                      Operations Console
                    </h2>
                  </div>
                </>
              )}
            </div>
          </div>

          <nav
            className={
              collapsed
                ? 'flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-2 py-4'
                : 'flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-3 py-4'
            }
          >
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  [
                    'group flex rounded-lg py-2.5 text-sm font-medium transition-colors',
                    collapsed ? 'items-center justify-center px-2' : 'items-center gap-3 px-3',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-secondary hover:text-secondary-foreground',
                  ].join(' ')
                }
              >
                <item.icon className="h-4 w-4" />
                {collapsed ? null : <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div
            className={
              collapsed ? 'border-t border-border/70 p-2' : 'border-t border-border/70 p-3'
            }
          >
            <Button
              type="button"
              variant="outline"
              className={collapsed ? 'w-full justify-center px-0' : 'w-full justify-start gap-2'}
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
              {collapsed ? null : 'Collapse sidebar'}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
