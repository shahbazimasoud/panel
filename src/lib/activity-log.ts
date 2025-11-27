'use client';

import { ActivityLogEvent } from './types';

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

export const getTodayTotalDuration = (): number => {
    const log = getActivityLog();
    const today = new Date().toISOString().split('T')[0];
    let totalSeconds = 0;
    let sessionStart: number | null = null;
    let lastActiveTimestamp: number | null = null;

    for (const event of log) {
        const eventDay = new Date(event.timestamp).toISOString().split('T')[0];
        if (eventDay !== today) continue;

        if (event.type === 'LOGIN') {
            sessionStart = event.timestamp;
            lastActiveTimestamp = event.timestamp;
        } else if (event.type === 'ACTIVE' && sessionStart !== null) {
            lastActiveTimestamp = event.timestamp;
        } else if (event.type === 'AWAY' && sessionStart !== null && lastActiveTimestamp !== null) {
            totalSeconds += (event.timestamp - lastActiveTimestamp) / 1000;
            lastActiveTimestamp = null; // Reset last active timestamp as user is now away
        } else if (event.type === 'LOGOUT' && sessionStart !== null) {
            if(lastActiveTimestamp !== null) {
                totalSeconds += (event.timestamp - lastActiveTimestamp) / 1000;
            }
            sessionStart = null;
            lastActiveTimestamp = null;
        }
    }

    // If there's an ongoing active session at the end of the log
    if (sessionStart !== null && lastActiveTimestamp !== null) {
        totalSeconds += (Date.now() - lastActiveTimestamp) / 1000;
    }
    
    return totalSeconds;
};

export const clearActivityLog = () => {
    localStorage.removeItem(ACTIVITY_LOG_KEY);
}
