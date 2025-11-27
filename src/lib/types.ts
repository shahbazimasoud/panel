export type UserStatus = 'online' | 'idle' | 'offline';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  status: UserStatus;
  department: string;
  bio?: string;
}

export interface System {
  id:string;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  url: string;
}
