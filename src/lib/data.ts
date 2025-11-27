import type { System, User, Guide } from './types';

export const users: User[] = [
  { id: '1', name: 'Arash Shams', email: 'admin@example.com', avatarUrl: 'https://picsum.photos/seed/user1/100/100', status: 'online', department: 'Engineering', bio: 'Full-Stack Developer', extension: '1234' },
  { id: '2', name: 'Sara Rezaei', email: 'sara.rezaei@example.com', avatarUrl: 'https://picsum.photos/seed/user2/100/100', status: 'idle', department: 'Human Resources', bio: 'HR Manager', extension: '1235' },
  { id: '3', name: 'Mohammad Akbari', email: 'mohammad.akbari@example.com', avatarUrl: 'https://picsum.photos/seed/user3/100/100', status: 'offline', department: 'Sales', extension: '1236' },
  { id: '4', name: 'Fatemeh Hosseini', email: 'fatemeh.hosseini@example.com', avatarUrl: 'https://picsum.photos/seed/user4/100/100', status: 'online', department: 'Engineering', bio: 'UI/UX Designer', extension: '1237' },
  { id: '5', name: 'Ali Moradi', email: 'ali.moradi@example.com', avatarUrl: 'https://picsum.photos/seed/user5/100/100', status: 'online', department: 'Support', extension: '1238' },
  { id: '6', name: 'Zahra Ahmadi', email: 'zahra.ahmadi@example.com', avatarUrl: 'https://picsum.photos/seed/user6/100/100', status: 'offline', department: 'Sales', extension: '1239' },
  { id: '7', name: 'Hassan Karimi', email: 'hassan.karimi@example.com', avatarUrl: 'https://picsum.photos/seed/user7/100/100', status: 'idle', department: 'Engineering', extension: '1240' },
  { id: '8', name: 'Negar Jafari', email: 'negar.jafari@example.com', avatarUrl: 'https://picsum.photos/seed/user8/100/100', status: 'online', department: 'Marketing', bio: 'SEO Specialist', extension: '1241' },
  { id: '9', name: 'Reza Ghasemi', email: 'reza.ghasemi@example.com', avatarUrl: 'https://picsum.photos/seed/user9/100/100', status: 'online', department: 'Engineering', extension: '1242' },
  { id: '10', name: 'Maryam Nouri', email: 'maryam.nouri@example.com', avatarUrl: 'https://picsum.photos/seed/user10/100/100', status: 'offline', department: 'Human Resources', extension: '1243' },
  { id: '11', name: 'Amir Salehi', email: 'amir.salehi@example.com', avatarUrl: 'https://picsum.photos/seed/user11/100/100', status: 'online', department: 'Support', extension: '1244' },
  { id: '12', name: 'Shima Asadi', email: 'shima.asadi@example.com', avatarUrl: 'https://picsum.photos/seed/user12/100/100', status: 'idle', department: 'Marketing', extension: '1245' },
  { id: '13', name: 'Mehdi Bagheri', email: 'mehdi.bagheri@example.com', avatarUrl: 'https://picsum.photos/seed/user13/100/100', status: 'online', department: 'Engineering', extension: '1246' },
  { id: '14', name: 'Parisa Davoodi', email: 'parisa.davoodi@example.com', avatarUrl: 'https://picsum.photos/seed/user14/100/100', status: 'offline', department: 'Sales', bio: 'Sales Expert', extension: '1247' },
  { id: '15', name: 'Saeed Heidari', email: 'saeed.heidari@example.com', avatarUrl: 'https://picsum.photos/seed/user15/100/100', status: 'online', department: 'Engineering', extension: '1248' },
  { id: '16', name: 'Elham Azizi', email: 'elham.azizi@example.com', avatarUrl: 'https://picsum.photos/seed/user16/100/100', status: 'idle', department: 'Support', extension: '1249' },
  { id: '17', name: 'Yousef Mahmoudi', email: 'yousef.mahmoudi@example.com', avatarUrl: 'https://picsum.photos/seed/user17/100/100', status: 'online', department: 'Engineering', bio: 'Project Manager', extension: '1250' },
  { id: '18', name: 'Roya Sadeghi', email: 'roya.sadeghi@example.com', avatarUrl: 'https://picsum.photos/seed/user18/100/100', status: 'offline', department: 'Human Resources', extension: '1251' },
  { id: '19', name: 'Javad Mousavi', email: 'javad.mousavi@example.com', avatarUrl: 'https://picsum.photos/seed/user19/100/100', status: 'online', department: 'Sales', extension: '1252' },
  { id: '20', name: 'Nazanin Abbasi', email: 'nazanin.abbasi@example.com', avatarUrl: 'https://picsum.photos/seed/user20/100/100', status: 'idle', department: 'Marketing', extension: '1253' },
  { id: '21', name: 'Kourosh Rostami', email: 'kourosh.rostami@example.com', avatarUrl: 'https://picsum.photos/seed/user21/100/100', status: 'online', department: 'Engineering', extension: '1254' },
  { id: '22', name: 'Azadeh Tehrani', email: 'azadeh.tehrani@example.com', avatarUrl: 'https://picsum.photos/seed/user22/100/100', status: 'offline', department: 'Support', extension: '1255' },
  { id: '23', name: 'Peyman Rajabi', email: 'peyman.rajabi@example.com', avatarUrl: 'https://picsum.photos/seed/user23/100/100', status: 'online', department: 'Engineering', extension: '1256' },
  { id: '24', name: 'Gelareh Zamani', email: 'gelareh.zamani@example.com', avatarUrl: 'https://picsum.photos/seed/user24/100/100', status: 'idle', department: 'Sales', extension: '1257' },
  { id: '25', name: 'Fereydoon Farrokhi', email: 'fereydoon.farrokhi@example.com', avatarUrl: 'https://picsum.photos/seed/user25/100/100', status: 'online', department: 'Marketing', extension: '1258' },
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

export const guides: Guide[] = [
  { id: '1', name: 'Onboarding Guide', description: 'Essential information for new employees to get started.', icon: 'ClipboardCheck', url: '#' },
  { id: '2', name: 'Remote Work Policy', description: 'Guidelines and best practices for working from home.', icon: 'Home', url: '#' },
  { id: '3', name: 'IT Security Handbook', description: 'How to keep our systems and data secure.', icon: 'ShieldCheck', url: '#' },
  { id: '4', name: 'Brand Guidelines', description: 'How to use our company brand and visual identity.', icon: 'Palette', url: '#' },
];


export const departments = [...new Set(users.map(u => u.department))];
