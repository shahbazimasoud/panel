import { Timestamp } from 'firebase/firestore';

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

export type ActivityLogEventDTO = {
  userId: string;
  type: 'LOGIN' | 'LOGOUT' | 'AWAY' | 'ACTIVE';
  timestamp: Timestamp;
  deviceInfo?: {
    device: string;
    os: string;
    browser: string;
  };
  ipAddress?: string;
  macAddress?: string;
};


export type ActivityLogEvent = Omit<ActivityLogEventDTO, 'timestamp'> & {
  timestamp: number; // as milliseconds
};

export type NoteDTO = {
  userId: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Note = Omit<NoteDTO, 'createdAt' | 'updatedAt'> & {
  id: string;
  createdAt: number;
  updatedAt: number;
};
