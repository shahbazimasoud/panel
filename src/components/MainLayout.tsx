'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import UserDirectory from '@/components/UserDirectory';
import PageHeader from './PageHeader';
import { useUser } from '@/firebase'; // Changed

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useUser(); // Changed

  useEffect(() => {
    // Wait until the initial loading is complete before checking the user state.
    if (!loading) {
      // If loading is finished and there's still no user, then redirect.
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // While Firebase is checking the auth state, show a loading indicator
  // or a blank screen to prevent premature redirects.
  if (loading) {
    // You can return a full-page loading spinner here for better UX
    return <div>Loading...</div>;
  }
  
  // If loading is done and there's no user, the useEffect above will have already
  // initiated the redirect. Returning null prevents rendering the layout for a split second.
  if (!user) {
    return null;
  }

  // If loading is done and there is a user, render the main layout.
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
