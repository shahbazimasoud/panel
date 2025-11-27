'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import UserDirectory from '@/components/UserDirectory';
import PageHeader from './PageHeader';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // In a real app, this would be more robust.
    // For this mock, we redirect if not logged in.
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      router.push('/login');
    }
  }, [router]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar side="left" collapsible="icon" className="border-r">
          <UserDirectory />
        </Sidebar>
        <SidebarInset>
          <PageHeader />
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
