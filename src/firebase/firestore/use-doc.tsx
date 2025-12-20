
'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * A marker type to ensure that the query/reference passed to the hook is memoized.
 * This is a trick to enforce the use of `useMemoFirebase` at the type level.
 */
type Memoized<T> = T & { __memo: true };

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 *
 * IMPORTANT! You MUST wrap the reference with the `useMemoFirebase` hook,
 * or the hook will enter an infinite loop.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {Memoized<DocumentReference> | null | undefined} memoizedDocRef -
 * The memoized Firestore DocumentReference.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  memoizedDocRef: Memoized<DocumentReference<DocumentData>> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
     if (memoizedDocRef && !('__memo' in memoizedDocRef)) {
      console.error('useDoc received a reference that was not created with useMemoFirebase. This will cause infinite loops.');
      setError(new Error('useDoc reference must be memoized with useMemoFirebase.'));
      setIsLoading(false);
      return;
    }

    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
