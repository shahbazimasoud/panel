'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import UserDirectory from '@/components/UserDirectory';
import PageHeader from './PageHeader';
import { useUser } from '@/firebase';
import { Notebook, Puzzle, Users } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import Notepad from './Notepad';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [activeView, setActiveView] = useState('users');


  useEffect(() => {
    // This effect handles redirection based on auth state.
    // It will only run AFTER the initial loading is complete.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);


  // While Firebase is checking the auth state, show a full-page loading indicator.
  // This prevents the premature rendering of content or incorrect redirects.
  if (isUserLoading) {
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
            {activeView === 'users' ? <UserDirectory /> : <Notepad />}
            <SidebarMenu className="mt-auto p-2">
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => setActiveView('users')}
                        isActive={activeView === 'users'}
                        tooltip="Members"
                    >
                        <Users />
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => setActiveView('notes')}
                        isActive={activeView === 'notes'}
                        tooltip="Notepad"
                    >
                        <Notebook />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </Sidebar>
        <SidebarInset>
          <PageHeader />
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
