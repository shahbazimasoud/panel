import type { System, User } from './types';

export const users: User[] = [
  { id: '1', name: 'Arash Shams', avatarUrl: 'https://picsum.photos/seed/user1/100/100', status: 'online', department: 'Engineering', bio: 'Full-Stack Developer', extension: '1234' },
  { id: '2', name: 'Sara Rezaei', avatarUrl: 'https://picsum.photos/seed/user2/100/100', status: 'idle', department: 'Human Resources', bio: 'HR Manager', extension: '1235' },
  { id: '3', name: 'Mohammad Akbari', avatarUrl: 'https://picsum.photos/seed/user3/100/100', status: 'offline', department: 'Sales', extension: '1236' },
  { id: '4', name: 'Fatemeh Hosseini', avatarUrl: 'https://picsum.photos/seed/user4/100/100', status: 'online', department: 'Engineering', bio: 'UI/UX Designer', extension: '1237' },
  { id: '5', name: 'Ali Moradi', avatarUrl: 'https://picsum.photos/seed/user5/100/100', status: 'online', department: 'Support', extension: '1238' },
  { id: '6', name: 'Zahra Ahmadi', avatarUrl: 'https://picsum.photos/seed/user6/100/100', status: 'offline', department: 'Sales', extension: '1239' },
  { id: '7', name: 'Hassan Karimi', avatarUrl: 'https://picsum.photos/seed/user7/100/100', status: 'idle', department: 'Engineering', extension: '1240' },
  { id: '8', name: 'Negar Jafari', avatarUrl: 'https://picsum.photos/seed/user8/100/100', status: 'online', department: 'Marketing', bio: 'SEO Specialist', extension: '1241' },
  { id: '9', name: 'Reza Ghasemi', avatarUrl: 'https://picsum.photos/seed/user9/100/100', status: 'online', department: 'Engineering', extension: '1242' },
  { id: '10', name: 'Maryam Nouri', avatarUrl: 'https://picsum.photos/seed/user10/100/100', status: 'offline', department: 'Human Resources', extension: '1243' },
  { id: '11', name: 'Amir Salehi', avatarUrl: 'https://picsum.photos/seed/user11/100/100', status: 'online', department: 'Support', extension: '1244' },
  { id: '12', name: 'Shima Asadi', avatarUrl: 'https://picsum.photos/seed/user12/100/100', status: 'idle', department: 'Marketing', extension: '1245' },
  { id: '13', name: 'Mehdi Bagheri', avatarUrl: 'https://picsum.photos/seed/user13/100/100', status: 'online', department: 'Engineering', extension: '1246' },
  { id: '14', name: 'Parisa Davoodi', avatarUrl: 'https://picsum.photos/seed/user14/100/100', status: 'offline', department: 'Sales', bio: 'Sales Expert', extension: '1247' },
  { id: '15', name: 'Saeed Heidari', avatarUrl: 'https://picsum.photos/seed/user15/100/100', status: 'online', department: 'Engineering', extension: '1248' },
  { id: '16', name: 'Elham Azizi', avatarUrl: 'https://picsum.photos/seed/user16/100/100', status: 'idle', department: 'Support', extension: '1249' },
  { id: '17', name: 'Yousef Mahmoudi', avatarUrl: 'https://picsum.photos/seed/user17/100/100', status: 'online', department: 'Engineering', bio: 'Project Manager', extension: '1250' },
  { id: '18', name: 'Roya Sadeghi', avatarUrl: 'https://picsum.photos/seed/user18/100/100', status: 'offline', department: 'Human Resources', extension: '1251' },
  { id: '19', name: 'Javad Mousavi', avatarUrl: 'https://picsum.photos/seed/user19/100/100', status: 'online', department: 'Sales', extension: '1252' },
  { id: '20', name: 'Nazanin Abbasi', avatarUrl: 'https://picsum.photos/seed/user20/100/100', status: 'idle', department: 'Marketing', extension: '1253' },
  { id: '21', name: 'Kourosh Rostami', avatarUrl: 'https://picsum.photos/seed/user21/100/100', status: 'online', department: 'Engineering', extension: '1254' },
  { id: '22', name: 'Azadeh Tehrani', avatarUrl: 'https://picsum.photos/seed/user22/100/100', status: 'offline', department: 'Support', extension: '1255' },
  { id: '23', name: 'Peyman Rajabi', avatarUrl: 'https://picsum.photos/seed/user23/100/100', status: 'online', department: 'Engineering', extension: '1256' },
  { id: '24', name: 'Gelareh Zamani', avatarUrl: 'https://picsum.photos/seed/user24/100/100', status: 'idle', department: 'Sales', extension: '1257' },
  { id: '25', name: 'Fereydoon Farrokhi', avatarUrl: 'https://picsum.photos/seed/user25/100/100', status: 'online', department: 'Marketing', extension: '1258' },
];

export const systems: System[] = [
    { id: '1', name: 'Company Email', description: 'Internal email service for official communications', icon: 'Mail', url: '#' },
    { id: '2', name: 'HR Portal', description: 'Manage leave requests and personnel affairs', icon: 'Users', url: '#' },
    { id: '3', name: 'Cloud Storage', description: 'Shared storage space for files and documents', icon: 'HardDrive', url: '#' },
    { id: '4', name: 'Organizational Calendar', description: 'Schedule meetings and company events', icon: 'Calendar', url: '#' },
    { id: '5', name: 'CRM', description: 'Track leads and manage customer relationships', icon: 'Briefcase', url: '#' },
    { id: '6', name: 'Technical Support', description: 'Ticketing system for support requests', icon: 'LifeBuoy', url: '#' },
    { id: '7', name: 'Documentation', description: 'Knowledge base and technical/organizational documents', icon: 'BookOpen', url: '#' },
    { id: '8', name: 'Project Management', description: 'Plan and track project progress', icon: 'Kanban', url: '#' },
];

export const departments = [...new Set(users.map(u => u.department))];
