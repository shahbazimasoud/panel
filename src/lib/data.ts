import type { System, User } from './types';

export const users: User[] = [
  { id: '1', name: 'آرش شمس', avatarUrl: 'https://picsum.photos/seed/user1/100/100', status: 'online', department: 'فنی', bio: 'توسعه دهنده فول استک' },
  { id: '2', name: 'سارا رضایی', avatarUrl: 'https://picsum.photos/seed/user2/100/100', status: 'idle', department: 'منابع انسانی', bio: 'مدیر منابع انسانی' },
  { id: '3', name: 'محمد اکبری', avatarUrl: 'https://picsum.photos/seed/user3/100/100', status: 'offline', department: 'فروش' },
  { id: '4', name: 'فاطمه حسینی', avatarUrl: 'https://picsum.photos/seed/user4/100/100', status: 'online', department: 'فنی', bio: 'طراح رابط کاربری' },
  { id: '5', name: 'علی مرادی', avatarUrl: 'https://picsum.photos/seed/user5/100/100', status: 'online', department: 'پشتیبانی' },
  { id: '6', name: 'زهرا احمدی', avatarUrl: 'https://picsum.photos/seed/user6/100/100', status: 'offline', department: 'فروش' },
  { id: '7', name: 'حسن کریمی', avatarUrl: 'https://picsum.photos/seed/user7/100/100', status: 'idle', department: 'فنی' },
  { id: '8', name: 'نگار جعفری', avatarUrl: 'https://picsum.photos/seed/user8/100/100', status: 'online', department: 'بازاریابی', bio: 'متخصص سئو' },
  { id: '9', name: 'رضا قاسمی', avatarUrl: 'https://picsum.photos/seed/user9/100/100', status: 'online', department: 'فنی' },
  { id: '10', name: 'مریم نوری', avatarUrl: 'https://picsum.photos/seed/user10/100/100', status: 'offline', department: 'منابع انسانی' },
  { id: '11', name: 'امیر صالحی', avatarUrl: 'https://picsum.photos/seed/user11/100/100', status: 'online', department: 'پشتیبانی' },
  { id: '12', name: 'شیما اسدی', avatarUrl: 'https://picsum.photos/seed/user12/100/100', status: 'idle', department: 'بازاریابی' },
  { id: '13', name: 'مهدی باقری', avatarUrl: 'https://picsum.photos/seed/user13/100/100', status: 'online', department: 'فنی' },
  { id: '14', name: 'پریسا داوودی', avatarUrl: 'https://picsum.photos/seed/user14/100/100', status: 'offline', department: 'فروش', bio: 'کارشناس فروش' },
  { id: '15', name: 'سعید حیدری', avatarUrl: 'https://picsum.photos/seed/user15/100/100', status: 'online', department: 'فنی' },
  { id: '16', name: 'الهام عزیزی', avatarUrl: 'https://picsum.photos/seed/user16/100/100', status: 'idle', department: 'پشتیبانی' },
  { id: '17', name: 'یوسف محمودی', avatarUrl: 'https://picsum.photos/seed/user17/100/100', status: 'online', department: 'فنی', bio: 'مدیر پروژه' },
  { id: '18', name: 'رویا صادقی', avatarUrl: 'https://picsum.photos/seed/user18/100/100', status: 'offline', department: 'منابع انسانی' },
  { id: '19', name: 'جواد موسوی', avatarUrl: 'https://picsum.photos/seed/user19/100/100', status: 'online', department: 'فروش' },
  { id: '20', name: 'نازنین عباسی', avatarUrl: 'https://picsum.photos/seed/user20/100/100', status: 'idle', department: 'بازاریابی' },
  { id: '21', name: 'کوروش رستمی', avatarUrl: 'https://picsum.photos/seed/user21/100/100', status: 'online', department: 'فنی' },
  { id: '22', name: 'آزاده تهرانی', avatarUrl: 'https://picsum.photos/seed/user22/100/100', status: 'offline', department: 'پشتیبانی' },
  { id: '23', name: 'پیمان رجبی', avatarUrl: 'https://picsum.photos/seed/user23/100/100', status: 'online', department: 'فنی' },
  { id: '24', name: 'گلاره زمانی', avatarUrl: 'https://picsum.photos/seed/user24/100/100', status: 'idle', department: 'فروش' },
  { id: '25', name: 'فریدون فرخی', avatarUrl: 'https://picsum.photos/seed/user25/100/100', status: 'online', department: 'بازاریابی' },
];

export const systems: System[] = [
    { id: '1', name: 'ایمیل سازمانی', description: 'سرویس ایمیل داخلی برای ارتباطات رسمی', icon: 'Mail', url: '#' },
    { id: '2', name: 'پورتال منابع انسانی', description: 'مدیریت درخواست‌های مرخصی و امور کارگزینی', icon: 'Users', url: '#' },
    { id: '3', name: 'فضای ابری', description: 'فضای ذخیره‌سازی مشترک برای فایل‌ها و اسناد', icon: 'HardDrive', url: '#' },
    { id: '4', name: 'تقویم سازمانی', description: 'برنامه‌ریزی جلسات و رویدادهای شرکت', icon: 'Calendar', url: '#' },
    { id: '5', name: 'مدیریت ارتباط با مشتری', description: 'پیگیری سرنخ‌ها و مدیریت مشتریان', icon: 'Briefcase', url: '#' },
    { id: '6', name: 'پشتیبانی فنی', description: 'سیستم تیکتینگ برای درخواست‌های پشتیبانی', icon: 'LifeBuoy', url: '#' },
    { id: '7', name: 'مستندات', description: 'پایگاه دانش و مستندات فنی و سازمانی', icon: 'BookOpen', url: '#' },
    { id: '8', name: 'مدیریت پروژه', description: 'برنامه‌ریزی و پیگیری پیشرفت پروژه‌ها', icon: 'Kanban', url: '#' },
];

export const departments = [...new Set(users.map(u => u.department))];
