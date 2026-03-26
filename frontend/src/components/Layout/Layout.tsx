import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Navbar } from '@/components/Layout/Navbar';
import { Sidebar } from '@/components/Layout/Sidebar';

export function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />

      <div className="md:pl-72">
        <Navbar onOpenSidebar={() => setMobileSidebarOpen(true)} />
        <main className="pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
