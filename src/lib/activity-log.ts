'use client';
import { addDoc, collection, getDocs, query, where, orderBy, Timestamp, Firestore } from 'firebase/firestore';
import type { ActivityLogEvent, ActivityLogEventDTO } from './types';
import { isSameDay, startOfDay } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function getDeviceInfo() {
    if (typeof window === 'undefined') {
        return { device: 'Unknown', os: 'Unknown', browser: 'Unknown' };
    }

    const ua = navigator.userAgent;
    let device = 'Computer';
    let os = 'Unknown';
    let browser = 'Unknown';

    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        device = 'Phone';
    }
    
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    
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
      device = 'Laptop';
    } else if (device === 'Computer') {
        device = 'PC';
    }

    return { device, os, browser };
}

// A simple in-memory cache to prevent logging the same event type consecutively.
let lastEventType: ActivityLogEvent['type'] | null = null;

export const logActivity = (firestore: Firestore, userId: string, type: ActivityLogEvent['type']) => {
  if (lastEventType === type) {
    return;
  }
  lastEventType = type;

  const deviceInfo = getDeviceInfo();
  const event: Omit<ActivityLogEventDTO, 'timestamp'> = {
    userId,
    type,
    deviceInfo,
  };
  
  const activityCollection = collection(firestore, 'activityLog');
  
  // Do not await, chain .catch for non-blocking error handling
  addDoc(activityCollection, { ...event, timestamp: Timestamp.now() })
    .catch(error => {
      // Create a rich, contextual error
      const permissionError = new FirestorePermissionError({
        path: activityCollection.path,
        operation: 'create',
        requestResourceData: {
            ...event,
            timestamp: '(SERVER_TIMESTAMP)' // Placeholder for server-generated value
        },
      });

      // Emit the error globally
      errorEmitter.emit('permission-error', permissionError);

      // Log to console for fallback debugging, but emitter is primary
      console.error("Error logging activity to Firestore:", error);
      
      // Reset last event type if logging fails to allow retry
      lastEventType = null;
  });
};


export const getTodayTotalDuration = async (firestore: Firestore, userId: string): Promise<number> => {
    const today = new Date();
    const startOfToday = startOfDay(today);
    
    const activityCollection = collection(firestore, 'activityLog');
    const q = query(
        activityCollection,
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(startOfToday)),
        orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const events: ActivityLogEvent[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as ActivityLogEventDTO;
        return {
            ...data,
            timestamp: data.timestamp.toMillis(),
        };
    });

    return calculateDailyTotal(events, today);
};


export const calculateDailyTotal = (dailyEvents: ActivityLogEvent[], date: Date): number => {
    let totalMilliseconds = 0;
    let lastActiveTimestamp: number | null = null;

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
};
