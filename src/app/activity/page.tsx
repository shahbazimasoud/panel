'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getActivityLog } from '@/lib/activity-log';
import type { ActivityLogEvent } from '@/lib/types';
import { ArrowLeft, LogIn, LogOut, Coffee, Timer } from 'lucide-react';
import { format, formatDuration, intervalToDuration } from 'date-fns';

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
  const duration = intervalToDuration({ start, end });
  return formatDuration(duration, {
    format: ['hours', 'minutes', 'seconds'],
    zero: false,
    delimiter: ', '
  }) || 'less than a second';
}

export default function ActivityPage() {
  const [log, setLog] = useState<GroupedLog>({});

  useEffect(() => {
    const rawLog = getActivityLog().reverse(); // Show most recent first
    const grouped = rawLog.reduce((acc, event) => {
      const date = format(new Date(event.timestamp), 'eeee, MMMM do, yyyy');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {} as GroupedLog);
    setLog(grouped);
  }, []);

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Activity Report</h1>
          <p className="text-muted-foreground">A detailed log of your session activity.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        {Object.keys(log).length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No activity has been logged yet.</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(log).map(([date, events]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle>{date}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {events.map((event, index) => {
                    const prevEvent = events[index + 1];
                    const duration = prevEvent ? formatEventDuration(prevEvent.timestamp, event.timestamp) : null;
                    
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
                                {duration && (event.type === 'AWAY' || event.type === 'LOGOUT') && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {`Duration of previous state: ${duration}`}
                                    </p>
                                )}
                            </div>
                        </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
