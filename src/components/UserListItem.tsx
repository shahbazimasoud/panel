'use client';

import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Phone } from 'lucide-react';

type UserListItemProps = {
  user: User;
};

const statusClasses = {
  online: 'bg-green-500',
  idle: 'bg-yellow-400',
  offline: 'bg-red-500',
};

const statusText = {
  online: 'Online',
  idle: 'Idle',
  offline: 'Offline',
};

export default function UserListItem({ user }: UserListItemProps) {
  const { toast } = useToast();
  const { open: sidebarOpen } = useSidebar();

  const handleUserClick = () => {
    // In a real app, this would integrate with Cisco Jabber or another messenger
    // For example: window.location.href = `jabber:user@example.com`;
    toast({
      title: 'Send Message',
      description: `Opening chat window with ${user.name}... (simulation)`,
    });
    console.log(`Starting chat with ${user.name}`);
  };

  const fallback = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const userContent = (
    <div
      className={cn(
        "w-full text-left p-2 rounded-md hover:bg-sidebar-accent transition-colors flex items-center gap-3 cursor-pointer",
        !sidebarOpen && "justify-center"
      )}
    >
      <div className="relative">
        <Avatar className={cn(!sidebarOpen && "h-8 w-8")}>
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <span
          className={cn(
            'absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-sidebar',
            statusClasses[user.status],
            !sidebarOpen && "h-2 w-2"
          )}
          title={statusText[user.status]}
        />
      </div>
      <div className={cn("flex-1 overflow-hidden", !sidebarOpen && "hidden")}>
        <p className="font-semibold truncate">{user.name}</p>
        {user.bio && (
          <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
        )}
      </div>
    </div>
  );

  const popoverContent = (
    <div className="flex flex-col gap-4">
       <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback className="text-4xl">{fallback}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h4 className="text-lg font-bold">{user.name}</h4>
          <p className="text-sm text-muted-foreground">{user.department}</p>
          {user.extension && (
            <div className="flex items-center text-sm text-muted-foreground pt-1">
              <Phone className="mr-2 h-4 w-4" />
              <span>Ext: {user.extension}</span>
            </div>
          )}
        </div>
      </div>
      {user.bio && <p className="text-sm text-foreground">{user.bio}</p>}
    </div>
  );

  if (!sidebarOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div onClick={handleUserClick}>{userContent}</div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.department}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className='w-full'>{userContent}</button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-80">
        {popoverContent}
      </PopoverContent>
    </Popover>
  );
}