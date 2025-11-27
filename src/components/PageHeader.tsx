'use client';

import { useEffect, useState, useCallback } from 'react';
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

const SESSION_STORAGE_KEY = 'orgconnect-session';

interface SessionData {
  date: string;
  totalSeconds: number;
  sessionStartTime: number | null;
}

const getToday = () => new Date().toISOString().split('T')[0];

// This is a mock. In a real app, you'd get this from a session/context.
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(loggedIn);
  }, []);

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    
    // On logout, update the total time for the day
    const sessionDataString = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionDataString) {
      try {
        const data: SessionData = JSON.parse(sessionDataString);
        if (data.sessionStartTime) {
          const sessionDuration = Math.floor((Date.now() - data.sessionStartTime) / 1000);
          data.totalSeconds += sessionDuration;
          data.sessionStartTime = null; // Mark session as ended
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
        }
      } catch (error) {
        console.error("Failed to parse session data on logout:", error);
      }
    }
    
    setIsAuthenticated(false);
  }

  const user = isAuthenticated ? users.find((u) => u.id === '1') : null; // Mock: Arash Shams

  return {
    isAuthenticated,
    user,
    isAdmin: isAuthenticated && user?.email === 'admin@example.com', // Example admin logic
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
    .join(':')
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
  
  const saveCurrentSession = useCallback(() => {
     if (isAuthenticated) {
        const sessionDataString = localStorage.getItem(SESSION_STORAGE_KEY);
        if (sessionDataString) {
          try {
            const data: SessionData = JSON.parse(sessionDataString);
            if (data.sessionStartTime) {
              const currentSessionDuration = Math.floor((Date.now() - data.sessionStartTime) / 1000);
              const updatedData: SessionData = {
                ...data,
                totalSeconds: data.totalSeconds + currentSessionDuration,
                sessionStartTime: Date.now(), // Reset start time for the next calculation
              };
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedData));
            }
          } catch (error) {
            console.error("Failed to update session data:", error);
          }
        }
      }
  }, [isAuthenticated]);


  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isAuthenticated) {
      const today = getToday();
      let data: SessionData;
      const sessionDataString = localStorage.getItem(SESSION_STORAGE_KEY);

      if (sessionDataString) {
          data = JSON.parse(sessionDataString);
          // If the stored date is not today, reset the timer for the new day.
          if(data.date !== today) {
              data = { date: today, totalSeconds: 0, sessionStartTime: Date.now() };
          } else if (!data.sessionStartTime) {
            // If it is today but no active session, start one.
             data.sessionStartTime = Date.now();
          }
      } else {
          // No session data found, start a new one for today.
          data = { date: today, totalSeconds: 0, sessionStartTime: Date.now() };
      }
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
      

      timer = setInterval(() => {
        const sessionDataString = localStorage.getItem(SESSION_STORAGE_KEY);
        if(sessionDataString) {
            const currentData: SessionData = JSON.parse(sessionDataString);
            const activeSessionDuration = currentData.sessionStartTime 
                ? Math.floor((Date.now() - currentData.sessionStartTime) / 1000)
                : 0;
            setSessionDuration(currentData.totalSeconds + activeSessionDuration);
        }
      }, 1000);

      // Save session on page unload
      window.addEventListener('beforeunload', saveCurrentSession);
    }
    
    return () => {
        if(timer) clearInterval(timer);
        window.removeEventListener('beforeunload', saveCurrentSession);
    };
  }, [isAuthenticated, saveCurrentSession]);

  const handleLogout = () => {
    saveCurrentSession(); // Save the final duration before logging out
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
