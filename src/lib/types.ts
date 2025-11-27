export type UserStatus = 'online' | 'idle' | 'offline';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  status: UserStatus;
  department: string;
  email: string;
  bio?: string;
  extension?: string;
}

export interface System {
  id:string;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  url: string;
}

export interface Guide {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  url: string;
}

export type ActivityLogEvent = {
  type: 'LOGIN' | 'LOGOUT' | 'AWAY' | 'ACTIVE';
  timestamp: number;
  deviceInfo?: {
    device: string;
    os: string;
    browser: string;
  };
};
