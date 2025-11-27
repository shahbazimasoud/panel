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

export const calculateDailyTotal = (allEvents: ActivityLogEvent[], date: Date): number => {
    let totalMilliseconds = 0;
    let lastActiveTimestamp: number | null = null;

    const startOfTargetDay = startOfDay(date);

    const dailyEvents = allEvents.filter(e => isSameDay(new Date(e.timestamp), startOfTargetDay));

    for (const event of dailyEvents) {
        if (event.type === 'ACTIVE' || event.type === 'LOGIN') {
            if (lastActiveTimestamp === null) {
                lastActiveTimestamp = event.timestamp;
            }
        } else if ((event.type === 'AWAY' || event.type === 'LOGOUT') && lastActiveTimestamp !== null) {
            totalMilliseconds += event.timestamp - lastActiveTimestamp;
            lastActiveTimestamp = null;
        }
    }
    
    if (lastActiveTimestamp !== null && isSameDay(date, new Date())) {
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
