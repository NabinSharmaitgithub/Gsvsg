
'use client';

import { useMemo, type DependencyList } from 'react';
import { firebaseConfig as devFirebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    const app = getApp();
    return getSdks(app);
  }

  // This configuration is used for Vercel deployments and other environments
  // where environment variables are set.
  const prodFirebaseConfig: FirebaseOptions = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Check if the essential prod vars are set.
  const useProdConfig = 
    prodFirebaseConfig.apiKey &&
    prodFirebaseConfig.authDomain &&
    prodFirebaseConfig.projectId;

  const firebaseApp = initializeApp(useProdConfig ? prodFirebaseConfig : devFirebaseConfig);

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

/**
 * A hook to create a stable, memoized reference to a Firestore query or reference.
 * This is CRITICAL for preventing infinite loops in `useCollection` and `useDoc`.
 * It adds a `__memo` flag that the hooks check for to ensure this is used.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T & { __memo: true } {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized === 'object' && memoized !== null) {
    // Attach a marker to the object to indicate it's memoized.
    (memoized as any).__memo = true;
  }
  
  return memoized as T & { __memo: true };
}


export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
