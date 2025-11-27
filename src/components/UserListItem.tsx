'use client';

import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type UserListItemProps = {
  user: User;
  sidebarCollapsed?: boolean;
};

const statusClasses = {
  online: 'bg-green-500',
  idle: 'bg-yellow-400',
  offline: 'bg-red-500',
};

const statusText = {
  online: 'آنلاین',
  idle: 'غیرفعال',
  offline: 'آفلاین',
};

export default function UserListItem({ user, sidebarCollapsed = false }: UserListItemProps) {
  const { toast } = useToast();

  const handleUserClick = () => {
    // In a real app, this would integrate with Cisco Jabber or another messenger
    // For example: window.location.href = `jabber:user@example.com`;
    toast({
      title: 'ارسال پیام',
      description: `پنجره چت با ${user.name} باز می‌شود... (شبیه‌سازی)`,
    });
    console.log(`Starting chat with ${user.name}`);
  };

  const fallback = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const content = (
    <div
      onClick={handleUserClick}
      className={cn(
        "w-full text-right p-2 rounded-md hover:bg-sidebar-accent transition-colors flex items-center gap-3 cursor-pointer",
        sidebarCollapsed && "justify-center"
      )}
    >
      <div className="relative">
        <Avatar className={cn(sidebarCollapsed && "h-8 w-8")}>
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <span
          className={cn(
            'absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-sidebar',
            statusClasses[user.status],
            sidebarCollapsed && "h-2 w-2"
          )}
          title={statusText[user.status]}
        />
      </div>
      <div className={cn("flex-1 overflow-hidden", sidebarCollapsed && "hidden")}>
        <p className="font-semibold truncate">{user.name}</p>
        {user.bio && (
          <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
        )}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {sidebarCollapsed ? <div>{content}</div> : <button className='w-full'>{content}</button>}
        </TooltipTrigger>
        {(sidebarCollapsed || user.bio || user.department) && (
            <TooltipContent side="left">
                <div className="text-right">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.department}</p>
                  {user.bio && <p className="text-sm mt-1">{user.bio}</p>}
                </div>
            </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
