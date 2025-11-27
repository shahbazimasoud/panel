'use client';

import { useState, useMemo } from 'react';
import { users, departments } from '@/lib/data';
import UserListItem from './UserListItem';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Users } from 'lucide-react';
import { SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';

export default function UserDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(
        (user) => departmentFilter === 'all' || user.department === departmentFilter
      );
  }, [searchTerm, departmentFilter]);
  
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-xl font-bold font-headline">اعضای سازمان</h2>
        </div>
        <div className="relative mt-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو..."
            className="w-full bg-background pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mt-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="فیلتر دپارتمان" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دپارتمان‌ها</SelectItem>
                {departments.map((dep) => (
                  <SelectItem key={dep} value={dep}>
                    {dep}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-4 pt-0">
            {filteredUsers.slice(0, visibleCount).map((user) => (
              <UserListItem key={user.id} user={user} />
            ))}
          </div>
        </ScrollArea>
      </SidebarContent>

      {visibleCount < filteredUsers.length && (
        <SidebarFooter className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setVisibleCount((prev) => prev + 20)}
          >
            نمایش بیشتر
          </Button>
        </SidebarFooter>
      )}
    </div>
  );
}
