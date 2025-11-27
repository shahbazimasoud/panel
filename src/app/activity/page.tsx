'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table';
import type { ActivityLogEvent, ActivityLogEventDTO } from '@/lib/types';
import { LogIn, LogOut, Coffee, Timer, FilterX, ArrowLeft, Monitor, Smartphone, Globe } from 'lucide-react';
import { format, formatDuration, intervalToDuration, startOfDay, isSameDay } from 'date-fns';
import { DatePicker } from '@/components/ui/datepicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

type DailyLog = {
  date: string;
  events: ActivityLogEvent[];
  totalActiveSeconds: number;
};

const eventIcons = {
  LOGIN: <LogIn className="text-green-500" />,
  LOGOUT: <LogOut className="text-red-500" />,
  AWAY: <Coffee className="text-yellow-500" />,
  ACTIVE: <Timer className="text-blue-500" />,
};

const eventText = {
  LOGIN: 'Logged In',
  LOGOUT: 'Logged Out',
  AWAY: 'Away from keyboard',
  ACTIVE: 'Returned to activity',
};

function formatEventDuration(start: number, end: number) {
  if (start > end) {
      [start, end] = [end, start];
  }
  const duration = intervalToDuration({ start, end });
  return formatDuration(duration, {
    format: ['hours', 'minutes', 'seconds'],
    zero: false,
    delimiter: ', '
  }) || 'less than a second';
}

function formatTotalDuration(totalSeconds: number): string {
    if (totalSeconds < 1) return '0 seconds';
    const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 });
    return formatDuration(duration, {
        format: ['hours', 'minutes', 'seconds'],
        zero: false,
    }) || '0 seconds';
}

function DeviceIcon({ device, os }: { device?: string; os?: string }) {
    if (device === 'Phone' || device === 'Tablet') {
        return <Smartphone className="mr-2 h-4 w-4" />;
    }
    return <Monitor className="mr-2 h-4 w-4" />;
}

// Helper function to calculate summary totals for a given set of events
function calculateSummary(events: ActivityLogEvent[], forDate?: Date): { totalActiveSeconds: number; totalAwaySeconds: number } {
    let totalActiveSeconds = 0;
    let totalAwaySeconds = 0;
    let lastEvent: ActivityLogEvent | null = null;

    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

    for (const event of sortedEvents) {
        if (lastEvent) {
            if (lastEvent.type === 'ACTIVE' || lastEvent.type === 'LOGIN') {
                totalActiveSeconds += (event.timestamp - lastEvent.timestamp) / 1000;
            } else if (lastEvent.type === 'AWAY') {
                totalAwaySeconds += (event.timestamp - lastEvent.timestamp) / 1000;
            }
        }
        lastEvent = event;
    }

    // If the user is currently active and we are looking at today's data, add the ongoing duration
    if (lastEvent && (lastEvent.type === 'ACTIVE' || lastEvent.type === 'LOGIN') && (!forDate || isSameDay(forDate, new Date()))) {
        totalActiveSeconds += (Date.now() - lastEvent.timestamp) / 1000;
    } else if (lastEvent && lastEvent.type === 'AWAY' && (!forDate || isSameDay(forDate, new Date()))){
        totalAwaySeconds += (Date.now() - lastEvent.timestamp) / 1000;
    }

    return { totalActiveSeconds, totalAwaySeconds };
}


export default function ActivityPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const activityLogQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'activityLog'),
        where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: rawLogDTO, isLoading: loading } = useCollection<ActivityLogEventDTO>(activityLogQuery);

  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const { processedLog, overallSummary } = useMemo(() => {
    if (!rawLogDTO) return { processedLog: [], overallSummary: { totalActiveSeconds: 0, totalAwaySeconds: 0 } };
    
    const rawLog: ActivityLogEvent[] = rawLogDTO.map(dto => ({
        ...dto,
        timestamp: dto.timestamp.toMillis(),
    }));

    // --- Filter logs for both summary and detailed list ---
    const filteredForSummary = rawLog.filter(event => {
        return !dateFilter || isSameDay(new Date(event.timestamp), startOfDay(dateFilter));
    });
    
    const overallSummary = calculateSummary(filteredForSummary, dateFilter);
    
    const filteredForList = filteredForSummary.filter(event => {
        return typeFilter === 'ALL' || event.type === typeFilter;
    });

    // --- Grouping for detailed daily logs ---
    const groupedByDay: Record<string, { events: ActivityLogEvent[] }> = {};
     for (const event of filteredForList) {
      const dateKey = format(new Date(event.timestamp), 'eeee, MMMM do, yyyy');
      if (!groupedByDay[dateKey]) {
        groupedByDay[dateKey] = { events: [] };
      }
      groupedByDay[dateKey].events.push(event);
    }
    
    const dailyTotals: Record<string, { totalActiveSeconds: number }> = {};
    const allGroupedByDay: Record<string, { events: ActivityLogEvent[] }> = {};
     for (const event of rawLog) {
      const dateKey = format(new Date(event.timestamp), 'eeee, MMMM do, yyyy');
      if (!allGroupedByDay[dateKey]) {
        allGroupedByDay[dateKey] = { events: [] };
      }
      allGroupedByDay[dateKey].events.push(event);
    }
    Object.keys(allGroupedByDay).forEach(dateKey => {
        const dailyEvents = allGroupedByDay[dateKey].events;
        const { totalActiveSeconds } = calculateSummary(dailyEvents, new Date(dateKey));
        dailyTotals[dateKey] = { totalActiveSeconds };
    });

     Object.keys(groupedByDay).forEach(dateKey => {
        groupedByDay[dateKey].events.sort((a,b) => b.timestamp - a.timestamp);
    });

    const sortedDays = Object.keys(groupedByDay).sort((a,b) => {
        // We parse the date from the key string to sort days chronologically
        return new Date(a).getTime() - new Date(b).getTime()
    }).reverse();

    const processedLogResult = sortedDays.map(dateKey => ({
      date: dateKey,
      events: groupedByDay[dateKey].events,
      totalActiveSeconds: dailyTotals[dateKey]?.totalActiveSeconds || 0
    }));

    return { processedLog: processedLogResult, overallSummary };

  }, [rawLogDTO, dateFilter, typeFilter]);


  const clearFilters = () => {
      setDateFilter(undefined);
      setTypeFilter('ALL');
  }

  const summaryTitle = dateFilter ? `خلاصه روز ${format(dateFilter, 'MMMM do, yyyy')}` : 'خلاصه کلی (تمام زمان‌ها)';

  return (
    <MainLayout>
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                  <Button variant="ghost" className="mb-2" asChild>
                    <Link href="/">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Link>
                  </Button>
                  <h1 className="text-3xl font-bold font-headline">گزارش فعالیت</h1>
                  <p className="text-muted-foreground">گزارش دقیق فعالیت‌های شما در سیستم.</p>
                </div>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>{summaryTitle}</CardTitle>
                    <CardDescription>مجموع زمان‌های فعال و غیرفعال بر اساس فیلتر انتخاب شده.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">مجموع زمان فعال</TableCell>
                                <TableCell className="text-right font-bold text-green-600">{formatTotalDuration(overallSummary.totalActiveSeconds)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">مجموع زمان غیرفعال</TableCell>
                                <TableCell className="text-right font-bold text-yellow-600">{formatTotalDuration(overallSummary.totalAwaySeconds)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>


            <Card className="mb-8">
                <CardHeader>
                <CardTitle>فیلترها</CardTitle>
                <CardDescription>گزارش فعالیت را بر اساس تاریخ یا نوع رویداد محدود کنید.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row">
                    <DatePicker date={dateFilter} setDate={setDateFilter} />
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="فیلتر بر اساس نوع" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">همه انواع</SelectItem>
                            <SelectItem value="LOGIN">ورود</SelectItem>
                            <SelectItem value="LOGOUT">خروج</SelectItem>
                            <SelectItem value="AWAY">عدم فعالیت</SelectItem>
                            <SelectItem value="ACTIVE">فعالیت مجدد</SelectItem>
                        </SelectContent>
                    </Select>
                    {(dateFilter || typeFilter !== 'ALL') && (
                        <Button variant="ghost" onClick={clearFilters}>
                            <FilterX className="mr-2 h-4 w-4" />
                            حذف فیلترها
                        </Button>
                    )}
                </CardContent>
            </Card>


            <div className="space-y-8">
                {loading ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">در حال بارگذاری فعالیت‌ها...</p>
                        </CardContent>
                    </Card>
                ) : processedLog.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">هیچ فعالیتی با فیلترهای فعلی مطابقت ندارد.</p>
                    </CardContent>
                </Card>
                ) : (
                processedLog.map((dayLog) => {
                    return (
                        <Card key={dayLog.date}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl">{dayLog.date}</CardTitle>
                                <p className="text-sm font-medium text-muted-foreground">
                                    زمان فعال روزانه: <span className="font-bold text-primary">{formatTotalDuration(dayLog.totalActiveSeconds)}</span>
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                            {dayLog.events.map((event, index) => {
                                const prevEvent = dayLog.events[index + 1];
                                let duration = null;

                                if(prevEvent) {
                                    if (event.type === 'AWAY' && (prevEvent.type === 'ACTIVE' || prevEvent.type === 'LOGIN')) {
                                        duration = formatEventDuration(prevEvent.timestamp, event.timestamp);
                                    } else if (event.type === 'LOGOUT' && (prevEvent.type === 'ACTIVE' || prevEvent.type === 'LOGIN')) {
                                        duration = formatEventDuration(prevEvent.timestamp, event.timestamp);
                                    } else if (event.type === 'ACTIVE' && prevEvent.type === 'AWAY') {
                                        duration = formatEventDuration(prevEvent.timestamp, event.timestamp)
                                    }
                                }

                                return (
                                    <li key={event.timestamp} className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                            {eventIcons[event.type]}
                                        </div>
                                        <div className="flex-1 pt-1.5">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">{eventText[event.type]}</p>
                                                <div className="text-xs text-muted-foreground space-y-1 text-right">
                                                    {event.deviceInfo && (
                                                        <div className="flex items-center justify-end">
                                                            <DeviceIcon device={event.deviceInfo.device} os={event.deviceInfo.os} />
                                                            {event.deviceInfo.device}, {event.deviceInfo.os}, {event.deviceInfo.browser}
                                                        </div>
                                                    )}
                                                     {event.ipAddress && (
                                                        <div className="flex items-center justify-end">
                                                            <Globe className="mr-2 h-4 w-4" />
                                                            {event.ipAddress}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(event.timestamp), 'HH:mm:ss')}
                                            </p>
                                            {duration && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                {event.type === 'ACTIVE'
                                                    ? `Away for: ${duration}`
                                                    : `Active for: ${duration}`
                                                }
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                            </ul>
                        </CardContent>
                        </Card>
                    )
                })
                )}
            </div>
        </div>
    </MainLayout>
  );
}
