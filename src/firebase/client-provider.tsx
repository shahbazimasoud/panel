'use client';

import { useMemo } from 'react';
import { FirebaseProvider, initializeFirebase } from '@/firebase';
import { firebaseConfig } from '@/firebase/config';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebase = useMemo(() => initializeFirebase(firebaseConfig), []);

  return (
    <FirebaseProvider
      app={firebase.app}
      auth={firebase.auth}
      firestore={firebase.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
