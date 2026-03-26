import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Navbar } from '@/components/Layout/Navbar';
import { Sidebar } from '@/components/Layout/Sidebar';

export function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={sidebarCollapsed ? 'md:pl-20' : 'md:pl-72'}>
        <Navbar onOpenSidebar={() => setMobileSidebarOpen(true)} />
        <main className="pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
