'use client';

import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Phone, MessageCircle } from 'lucide-react';

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

  const handleDoubleClick = () => {
    // In a real app, this would integrate with Cisco Jabber or another messenger
    toast({
      title: 'Starting Chat...',
      description: `Opening Cisco Jabber chat with ${user.name}.`,
      icon: <MessageCircle className="animate-spin" />,
    });
    window.location.href = `im:${user.email}`;
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the popover from closing
    if (user.extension) {
      toast({
        title: 'Starting Call...',
        description: `Calling extension ${user.extension} via Cisco Jabber.`,
        icon: <Phone className="animate-spin" />,
      });
      window.location.href = `tel:${user.extension}`;
    }
  };

  const fallback = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const userContent = (
    <div
      onDoubleClick={handleDoubleClick}
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
            <a
              href={`tel:${user.extension}`}
              onClick={handleCallClick}
              className="flex items-center text-sm text-muted-foreground pt-1 hover:text-primary cursor-pointer"
            >
              <Phone className="mr-2 h-4 w-4" />
              <span>Ext: {user.extension}</span>
            </a>
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
            <div onDoubleClick={handleDoubleClick}>{userContent}</div>
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
