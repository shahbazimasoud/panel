'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import UserDirectory from '@/components/UserDirectory';
import PageHeader from './PageHeader';
import { useUser } from '@/firebase';
import { Puzzle } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    // This effect handles redirection based on auth state.
    // It will only run AFTER the initial loading is complete.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  // While Firebase is checking the auth state, show a full-page loading indicator.
  // This prevents the premature rendering of content or incorrect redirects.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Puzzle className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }
  
  // If loading is complete and there's no user, the useEffect above will handle
  // the redirect. Returning null prevents rendering the layout for a split second
  // before the redirect happens.
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
