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
  totalAwaySeconds: number;
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
            const timeDiffSeconds = (event.timestamp - lastEvent.timestamp) / 1000;
            if (lastEvent.type === 'ACTIVE' || lastEvent.type === 'LOGIN') {
                totalActiveSeconds += timeDiffSeconds;
            } else if (lastEvent.type === 'AWAY') {
                totalAwaySeconds += timeDiffSeconds;
            }
        }
        lastEvent = event;
    }

    // If the user is currently active/away and we are looking at today's data, add the ongoing duration
    const isTodayOrNoFilter = !forDate || isSameDay(forDate, new Date());
    if (lastEvent && isTodayOrNoFilter) {
        const ongoingDurationSeconds = (Date.now() - lastEvent.timestamp) / 1000;
        if (lastEvent.type === 'ACTIVE' || lastEvent.type === 'LOGIN') {
           totalActiveSeconds += ongoingDurationSeconds;
        } else if (lastEvent.type === 'AWAY') {
           totalAwaySeconds += ongoingDurationSeconds;
        }
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

  const processedLog = useMemo(() => {
    if (!rawLogDTO) return [];
    
    const rawLog: ActivityLogEvent[] = rawLogDTO.map(dto => ({
        ...dto,
        timestamp: dto.timestamp.toMillis(),
    }));

    // --- Filter logs based on UI filters ---
    const filteredEventsForDisplay = rawLog.filter(event => {
        const dateMatch = !dateFilter || isSameDay(new Date(event.timestamp), startOfDay(dateFilter));
        const typeMatch = typeFilter === 'ALL' || event.type === typeFilter;
        return dateMatch && typeMatch;
    });
    
    // --- Group all events by day, ignoring the type filter for daily summary calculations ---
    const allEventsByDay: Record<string, ActivityLogEvent[]> = {};
    const relevantEventsForDailyTotals = dateFilter ? rawLog.filter(e => isSameDay(new Date(e.timestamp), dateFilter)) : rawLog;
    
    for (const event of relevantEventsForDailyTotals) {
      const dateKey = format(new Date(event.timestamp), 'eeee, MMMM do, yyyy');
      if (!allEventsByDay[dateKey]) {
        allEventsByDay[dateKey] = [];
      }
      allEventsByDay[dateKey].push(event);
    }
    
    // --- Group events for display (respecting type filter) ---
    const displayEventsByDay: Record<string, ActivityLogEvent[]> = {};
    for (const event of filteredEventsForDisplay) {
        const dateKey = format(new Date(event.timestamp), 'eeee, MMMM do, yyyy');
        if (!displayEventsByDay[dateKey]) {
            displayEventsByDay[dateKey] = [];
        }
        displayEventsByDay[dateKey].push(event);
    }

    // --- Process into final structure ---
    const processedLogResult: DailyLog[] = Object.keys(displayEventsByDay).map(dateKey => {
        const dailyEventsForSummary = allEventsByDay[dateKey] || [];
        // Pass the actual date of the key to calculateSummary for accurate ongoing session calculation
        const { totalActiveSeconds, totalAwaySeconds } = calculateSummary(dailyEventsForSummary, new Date(dateKey.replace(/(\d+)(st|nd|rd|th)/, "$1")));
        
        const sortedDisplayEvents = [...displayEventsByDay[dateKey]].sort((a,b) => b.timestamp - a.timestamp);

        return {
            date: dateKey,
            events: sortedDisplayEvents,
            totalActiveSeconds,
            totalAwaySeconds
        }
    });

    return processedLogResult.sort((a,b) => {
         return new Date(b.date.replace(/(\d+)(st|nd|rd|th)/, "$1")).getTime() - new Date(a.date.replace(/(\d+)(st|nd|rd|th)/, "$1")).getTime()
    });

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
                  <p className="text-muted-foreground">A detailed log of your activities in the system.</p>
                </div>
            </div>

            <Card className="mb-8">
                <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Narrow down the activity log by date or event type.</CardDescription>
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
                        <p className="text-muted-foreground">Loading activities...</p>
                        </CardContent>
                    </Card>
                ) : processedLog.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No activities match the current filters.</p>
                    </CardContent>
                </Card>
                ) : (
                processedLog.map((dayLog) => {
                    return (
                        <Card key={dayLog.date}>
                        <CardHeader>
                            <CardTitle className="text-xl">{dayLog.date}</CardTitle>
                             <CardDescription>Summary of your activity for this day.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                             <Table className="mb-6 border-b">
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Daily Active Time</TableCell>
                                        <TableCell className="text-right font-bold text-green-600">{formatTotalDuration(dayLog.totalActiveSeconds)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Daily Away Time</TableCell>
                                        <TableCell className="text-right font-bold text-yellow-600">{formatTotalDuration(dayLog.totalAwaySeconds)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
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
