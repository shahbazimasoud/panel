'use client';

import { ActivityLogEvent } from './types';
import { isSameDay, startOfDay } from 'date-fns';

const ACTIVITY_LOG_KEY = 'orgconnect-activity-log';

export const logActivity = (type: ActivityLogEvent['type']) => {
  const log: ActivityLogEvent[] = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
  
  // To prevent logging duplicate events, check the last event type.
  if (log.length > 0 && log[log.length - 1].type === type) {
    return;
  }
  
  log.push({ type, timestamp: Date.now() });
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
};

export const getActivityLog = (): ActivityLogEvent[] => {
  return JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
};

export const calculateDailyTotal = (events: ActivityLogEvent[], date: Date): number => {
    let totalMilliseconds = 0;
    let lastActiveTimestamp: number | null = null;

    const dailyEvents = events.filter(e => isSameDay(new Date(e.timestamp), date));
    
    // Find first login or active event on that day to start counting
    const firstEvent = dailyEvents.find(e => e.type === 'LOGIN' || e.type === 'ACTIVE');
    if (!firstEvent) return 0;
    
    // Start tracking from the beginning of the day or the first event, whichever is later
    let currentTime = startOfDay(date).getTime();

    for (const event of dailyEvents) {
        if(event.timestamp < currentTime) continue;

        if (event.type === 'ACTIVE' || event.type === 'LOGIN') {
            lastActiveTimestamp = event.timestamp;
        } else if ((event.type === 'AWAY' || event.type === 'LOGOUT') && lastActiveTimestamp) {
            totalMilliseconds += event.timestamp - lastActiveTimestamp;
            lastActiveTimestamp = null; // User is now away or logged out
        }
    }
    
    // If user is still active at the end of the log and the log is for today
    if (lastActiveTimestamp && isSameDay(date, new Date())) {
        totalMilliseconds += Date.now() - lastActiveTimestamp;
    }

    return totalMilliseconds / 1000;
}


export const getTodayTotalDuration = (): number => {
    const log = getActivityLog();
    return calculateDailyTotal(log, new Date());
};

export const clearActivityLog = () => {
    localStorage.removeItem(ACTIVITY_LOG_KEY);
}
