import {
  Boxes,
  Cog,
  Factory,
  FileBarChart2,
  LogOut,
  Package,
  ShoppingCart,
  Users2,
  Wrench,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  mobileOpen: boolean;
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

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles || !user?.role) {
      return true;
    }

    return item.roles.includes(user.role);
  });

  const handleSignout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-border/80 bg-card/90 backdrop-blur-md transition-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border/70 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Bike Parts System
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Operations Console</h2>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-secondary hover:text-secondary-foreground',
                  ].join(' ')
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-border/70 p-3">
            <Button className="w-full justify-start" variant="outline" onClick={handleSignout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
