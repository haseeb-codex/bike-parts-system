import { Menu, Settings, UserCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onOpenSidebar: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/materials': 'Materials',
  '/production': 'Production',
  '/inventory': 'Inventory',
  '/sales': 'Sales',
  '/employees': 'Employees',
  '/financial': 'Financial',
  '/utilities': 'Utilities',
  '/account': 'Account Settings',
};

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function Navbar({ onOpenSidebar }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTitle = ROUTE_TITLES[location.pathname] || 'Operations';

  const handleSignout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button className="md:hidden" size="icon" variant="outline" onClick={onOpenSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Control Panel
            </p>
            <h1 className="text-lg font-semibold text-foreground">{currentTitle}</h1>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-3 rounded-full border border-border/80 bg-card px-2.5 py-1.5 hover:bg-secondary"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {getInitials(user?.name)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-tight">
                {user?.name || 'User'}
              </span>
              <span className="block text-xs text-muted-foreground">
                {user?.role || 'operator'}
              </span>
            </span>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border/80 bg-card p-2 shadow-lg">
              <div className="px-2 py-2">
                <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || 'No email available'}
                </p>
              </div>
              <div className="my-1 h-px bg-border" />
              <Link
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-secondary"
                onClick={() => setMenuOpen(false)}
                to="/account"
              >
                <UserCircle2 className="h-4 w-4" />
                Account Settings
              </Link>
              <button
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-secondary"
                onClick={() => setMenuOpen(false)}
                type="button"
              >
                <Settings className="h-4 w-4" />
                Preferences
              </button>
              <div className="my-1 h-px bg-border" />
              <button
                className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                onClick={handleSignout}
                type="button"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
