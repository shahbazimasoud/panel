'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getActivityLog, calculateDailyTotal } from '@/lib/activity-log';
import type { ActivityLogEvent } from '@/lib/types';
import { ArrowLeft, LogIn, LogOut, Coffee, Timer, FilterX } from 'lucide-react';
import { format, formatDuration, intervalToDuration, startOfDay, isSameDay } from 'date-fns';
import { DatePicker } from '@/components/ui/datepicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/MainLayout';

type GroupedLog = Record<string, ActivityLogEvent[]>;

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


export default function ActivityPage() {
  const [rawLog, setRawLog] = useState<ActivityLogEvent[]>([]);
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    setRawLog(getActivityLog().reverse()); // Show most recent first
  }, []);

  const filteredAndGroupedLog = useMemo(() => {
    let log = rawLog;

    if (dateFilter) {
      const startOfFilterDate = startOfDay(dateFilter);
      log = log.filter(event => isSameDay(new Date(event.timestamp), startOfFilterDate));
    }

    if (typeFilter !== 'ALL') {
      log = log.filter(event => event.type === typeFilter);
    }
    
    const grouped = log.reduce((acc, event) => {
      const date = format(new Date(event.timestamp), 'eeee, MMMM do, yyyy');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {} as GroupedLog);

    return grouped;
  }, [rawLog, dateFilter, typeFilter]);

  const clearFilters = () => {
      setDateFilter(undefined);
      setTypeFilter('ALL');
  }

  return (
    <MainLayout>
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
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
                {Object.keys(filteredAndGroupedLog).length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No activity matches the current filters.</p>
                    </CardContent>
                </Card>
                ) : (
                Object.entries(filteredAndGroupedLog).map(([date, events]) => {
                    const dailyTotalInSeconds = calculateDailyTotal(rawLog.slice().reverse(), new Date(events[0].timestamp));

                    return (
                        <Card key={date}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>{date}</CardTitle>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Active Time: <span className="font-bold text-primary">{formatTotalDuration(dailyTotalInSeconds)}</span>
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                            {events.map((event, index) => {
                                const prevEvent = events[index + 1];
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
                                            <p className="font-medium">{eventText[event.type]}</p>
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
