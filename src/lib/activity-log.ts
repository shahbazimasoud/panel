'use client';

import { ActivityLogEvent } from './types';
import { isSameDay, startOfDay } from 'date-fns';

const ACTIVITY_LOG_KEY = 'orgconnect-activity-log';

function getDeviceInfo() {
    if (typeof window === 'undefined') {
        return { device: 'Unknown', os: 'Unknown', browser: 'Unknown' };
    }

    const ua = navigator.userAgent;
    let device = 'Computer';
    let os = 'Unknown';
    let browser = 'Unknown';

    // Device
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        device = 'Phone';
    }
    
    // OS
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    
    // Browser
    if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/MSIE|Trident/i.test(ua)) browser = 'Internet Explorer';
    
    if (device === 'Phone' && (os === 'iOS' || os === 'macOS')) {
        if (/iPad/i.test(ua)) {
            device = 'Tablet';
        }
    }
    
    if (device === 'Computer' && os === 'macOS') {
      // Could be MacBook or iMac etc, we'll just say Laptop for simplicity
      device = 'Laptop';
    } else if (device === 'Computer') {
        device = 'PC';
    }


    return { device, os, browser };
}

export const logActivity = (type: ActivityLogEvent['type']) => {
  const log: ActivityLogEvent[] = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
  
  // To prevent logging duplicate events, check the last event type.
  if (log.length > 0 && log[log.length - 1].type === type) {
    return;
  }

  const deviceInfo = getDeviceInfo();
  
  log.push({ type, timestamp: Date.now(), deviceInfo });
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
};

export const getActivityLog = (): ActivityLogEvent[] => {
  return JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
};

export const calculateDailyTotal = (allEvents: ActivityLogEvent[], date: Date): number => {
    let totalMilliseconds = 0;
    let lastActiveTimestamp: number | null = null;

    const startOfTargetDay = startOfDay(date);

    const dailyEvents = allEvents.filter(e => isSameDay(new Date(e.timestamp), startOfTargetDay))
                                 .slice()
                                 .sort((a,b) => a.timestamp - b.timestamp);


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
    
    // If the user is currently active on the target day (which would be today)
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
