'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  SidebarTrigger
} from '@/components/ui/sidebar';
import {
  User,
  LogIn,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { users } from '@/lib/data';

// This is a mock. In a real app, you'd get this from a session/context.
const useAuth = () => {
  // To test the logged-out state, change this to `false`
  const isAuthenticated = true;
  const user = isAuthenticated ? users.find((u) => u.id === '1') : null; // Mock: Arash Shams

  return {
    isAuthenticated,
    user,
    isAdmin: isAuthenticated && user?.email === 'admin@example.com', // Example admin logic
  };
};

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s]
    .map((v) => (v < 10 ? '0' + v : v))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
}


export default function PageHeader() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { open, toggleSidebar } = useSidebar();
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  return (
    <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="flex items-center gap-2">
          {open ? <PanelLeftClose /> : <PanelLeftOpen />}
          <span className="sr-only">Toggle user directory</span>
        </SidebarTrigger>
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            {isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <User />
                  Admin Panel
                </Link>
              </Button>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(sessionDuration)}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/login">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button asChild>
            <Link href="/login">
              <LogIn className="mr-2" />
              Login
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
