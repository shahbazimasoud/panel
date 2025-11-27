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
  Settings,
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
import { cn } from '@/lib/utils';
import type { UserStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';


// This is a mock. In a real app, you'd get this from a session/context.
const useAuth = () => {
  // To test the logged-out state, change this to `false`
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // This check runs only on the client
    const loggedIn = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(loggedIn);
  }, []);
  
  const user = isAuthenticated ? users.find((u) => u.id === '1') : null; // Mock: Arash Shams

  const login = () => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('sessionStartTime', Date.now().toString());
    setIsAuthenticated(true);
  }

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('sessionStartTime');
    setIsAuthenticated(false);
  }

  return {
    isAuthenticated,
    user,
    isAdmin: isAuthenticated && user?.email === 'admin@example.com', // Example admin logic
    login,
    logout
  };
};

function formatDuration(seconds: number) {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s]
    .map((v) => (v < 10 ? '0' + v : v))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':') || '0:00';
}

const statusClasses: Record<UserStatus, string> = {
  online: 'bg-green-500',
  idle: 'bg-yellow-400',
  offline: 'bg-red-500',
};

export default function PageHeader() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { open, toggleSidebar } = useSidebar();
  const [sessionDuration, setSessionDuration] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isAuthenticated) {
      const sessionStartTime = localStorage.getItem('sessionStartTime');
      if (sessionStartTime) {
         timer = setInterval(() => {
            const now = Date.now();
            const start = parseInt(sessionStartTime, 10);
            setSessionDuration(Math.floor((now - start) / 1000));
        }, 1000);
      }
    }
    return () => {
        if(timer) clearInterval(timer);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

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
                   <span
                    className={cn(
                      'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background',
                      statusClasses[user.status]
                    )}
                  />
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
                   <Link href="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
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
