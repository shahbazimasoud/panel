'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { calculateDailyTotal } from '@/lib/activity-log';
import type { ActivityLogEvent, ActivityLogEventDTO } from '@/lib/types';
import { LogIn, LogOut, Coffee, Timer, FilterX, ArrowLeft, Monitor, Smartphone } from 'lucide-react';
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


export default function ActivityPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const activityLogQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // The orderBy clause is removed to avoid needing a composite index
    return query(
        collection(firestore, 'activityLog'),
        where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: rawLogDTO, isLoading: loading } = useCollection<ActivityLogEventDTO>(activityLogQuery);

  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const processedLog = useMemo(() => {
    if (!rawLogDTO) return [];
    
    const rawLog: ActivityLogEvent[] = rawLogDTO.map(dto => ({
        ...dto,
        timestamp: dto.timestamp.toMillis(),
    }));

    const filteredLog = rawLog.filter(event => {
      const isDateMatch = !dateFilter || isSameDay(new Date(event.timestamp), startOfDay(dateFilter));
      const isTypeMatch = typeFilter === 'ALL' || event.type === typeFilter;
      return isDateMatch && isTypeMatch;
    });
    
    const groupedByDay: Record<string, { events: ActivityLogEvent[], totalActiveSeconds: number }> = {};

    // Group all events by day first to calculate totals correctly, regardless of filter
    const allEventsSorted = [...rawLog].sort((a, b) => a.timestamp - b.timestamp);
    for (const event of allEventsSorted) {
      const dateKey = format(new Date(event.timestamp), 'eeee, MMMM do, yyyy');
      if (!groupedByDay[dateKey]) {
        groupedByDay[dateKey] = { events: [], totalActiveSeconds: 0 };
      }
      groupedByDay[dateKey].events.push(event);
    }
    
    // Calculate total active time for each day that has events
    Object.keys(groupedByDay).forEach(dateKey => {
        groupedByDay[dateKey].totalActiveSeconds = calculateDailyTotal(groupedByDay[dateKey].events, new Date(dateKey));
    });

    const displayGroupedByDay: Record<string, { events: ActivityLogEvent[] }> = {};
     for (const event of filteredLog) {
      const dateKey = format(new Date(event.timestamp), 'eeee, MMMM do, yyyy');
      if (!displayGroupedByDay[dateKey]) {
        displayGroupedByDay[dateKey] = { events: [] };
      }
      displayGroupedByDay[dateKey].events.push(event);
    }
     Object.keys(displayGroupedByDay).forEach(dateKey => {
        // Sort events within each day group in descending order (newest first) for display
        displayGroupedByDay[dateKey].events.sort((a,b) => b.timestamp - a.timestamp);
    });

    // Sort the days themselves in descending order (most recent day first)
    const sortedDays = Object.keys(displayGroupedByDay).sort((a,b) => {
        return new Date(b).getTime() - new Date(a).getTime()
    });

    return sortedDays.map(dateKey => ({
      date: dateKey,
      events: displayGroupedByDay[dateKey].events,
      totalActiveSeconds: groupedByDay[dateKey]?.totalActiveSeconds || 0
    }));

  }, [rawLogDTO, dateFilter, typeFilter]);


  const clearFilters = () => {
      setDateFilter(undefined);
      setTypeFilter('ALL');
  }

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
                  <h1 className="text-3xl font-bold font-headline">Activity Report</h1>
                  <p className="text-muted-foreground">A detailed log of your session activity.</p>
                </div>
            </div>

            <Card className="mb-8">
                <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Refine the activity log by date or event type.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row">
                    <DatePicker date={dateFilter} setDate={setDateFilter} />
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="LOGIN">Login</SelectItem>
                            <SelectItem value="LOGOUT">Logout</SelectItem>
                            <SelectItem value="AWAY">Away</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                        </SelectContent>
                    </Select>
                    {(dateFilter || typeFilter !== 'ALL') && (
                        <Button variant="ghost" onClick={clearFilters}>
                            <FilterX className="mr-2 h-4 w-4" />
                            Clear Filters
                        </Button>
                    )}
                </CardContent>
            </Card>


            <div className="space-y-8">
                {loading ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Loading activity...</p>
                        </CardContent>
                    </Card>
                ) : processedLog.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No activity matches the current filters.</p>
                    </CardContent>
                </Card>
                ) : (
                processedLog.map((dayLog) => {
                    return (
                        <Card key={dayLog.date}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>{dayLog.date}</CardTitle>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Active Time: <span className="font-bold text-primary">{formatTotalDuration(dayLog.totalActiveSeconds)}</span>
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                            {dayLog.events.map((event, index) => {
                                const prevEvent = dayLog.events[index + 1];
                                let duration = null;

                                if(prevEvent) {
                                    if (event.type === 'AWAY' && prevEvent.type === 'ACTIVE') {
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
                                                {event.deviceInfo && (
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <DeviceIcon device={event.deviceInfo.device} os={event.deviceInfo.os} />
                                                        {event.deviceInfo.device}, {event.deviceInfo.os}, {event.deviceInfo.browser}
                                                    </div>
                                                )}
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
