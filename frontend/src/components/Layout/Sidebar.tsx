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
import { useI18n } from '@/i18n/LanguageProvider';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/types/auth';

interface SidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

interface NavItem {
  labelKey: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'route.dashboard', path: '/', icon: Boxes },
  { labelKey: 'route.materials', path: '/materials', icon: Package },
  { labelKey: 'route.production', path: '/production', icon: Factory },
  { labelKey: 'route.inventory', path: '/inventory', icon: FileBarChart2 },
  { labelKey: 'route.sales', path: '/sales', icon: ShoppingCart },
  {
    labelKey: 'route.employees',
    path: '/employees',
    icon: Users2,
    roles: ['admin', 'super_admin'],
  },
  {
    labelKey: 'route.financial',
    path: '/financial',
    icon: FileBarChart2,
    roles: ['admin', 'super_admin'],
  },
  { labelKey: 'route.utilities', path: '/utilities', icon: Wrench, roles: ['super_admin'] },
  { labelKey: 'route.account', path: '/account', icon: Cog },
];

export function Sidebar({ mobileOpen, collapsed, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const { user } = useAuth();
  const { isRtl, t } = useI18n();

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
          'fixed inset-y-0 z-40 overflow-x-hidden bg-card/90 backdrop-blur-md transition-all duration-300',
          isRtl ? 'right-0 border-l border-border/80' : 'left-0 border-r border-border/80',
          collapsed
            ? 'w-[85vw] max-w-xs md:w-20 md:max-w-none'
            : 'w-[85vw] max-w-xs md:w-72 md:max-w-none',
          mobileOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full',
          'md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          <div
            className={
              collapsed
                ? 'relative flex h-16 items-center justify-center border-b border-border/70 px-3'
                : 'relative flex h-16 items-center border-b border-border/70 px-5'
            }
          >
            <div
              className={
                collapsed ? 'grid place-items-center' : 'flex items-start justify-between gap-3'
              }
            >
              {collapsed ? (
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10">
                  <span className="text-lg font-bold text-primary">BP</span>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {t('sidebar.brandTitle', 'Bike Parts System')}
                    </p>
                    <h2 className="text-base font-semibold leading-tight text-foreground">
                      {t('sidebar.brandSubtitle', 'Operations Console')}
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
                title={collapsed ? t(item.labelKey) : undefined}
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
                {collapsed ? null : <span>{t(item.labelKey)}</span>}
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
              aria-label={
                collapsed
                  ? t('sidebar.expand', 'Expand sidebar')
                  : t('sidebar.collapse', 'Collapse sidebar')
              }
              title={
                collapsed
                  ? t('sidebar.expand', 'Expand sidebar')
                  : t('sidebar.collapse', 'Collapse sidebar')
              }
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
              {collapsed ? null : t('sidebar.collapse', 'Collapse sidebar')}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
