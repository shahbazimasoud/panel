'use client';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { User, LogIn, PanelRightClose, PanelRightOpen } from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/components/ui/sidebar';


// This is a mock. In a real app, you'd get this from a session/context.
const useAuth = () => ({
  isAuthenticated: false, // Change to true to see the "Admin Panel" button after login
  isAdmin: true,
});

export default function PageHeader() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { open, toggleSidebar } = useSidebar();
  
  return (
    <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
         {/* This is a trigger for a potential left sidebar, keeping it for now */}
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            {isAdmin && (
              <Button variant="outline" asChild>
                <Link href="/admin">
                  <User className="ltr:mr-2 rtl:ml-2" />
                  پنل ادمین
                </Link>
              </Button>
            )}
          </>
        ) : (
          <Button asChild>
            <Link href="/login">
              <LogIn className="ltr:mr-2 rtl:ml-2" />
              ورود
            </Link>
          </Button>
        )}
        <SidebarTrigger>
          {open ? <PanelRightClose /> : <PanelRightOpen />}
          <span className="sr-only">Toggle user directory</span>
        </SidebarTrigger>
      </div>
    </div>
  );
}
