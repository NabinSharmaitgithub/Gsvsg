
'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { useMemoFirebase } from '@/firebase/provider';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * A marker type to ensure that the query/reference passed to the hook is memoized.
 * This is a trick to enforce the use of `useMemoFirebase` at the type level.
 */
type Memoized<T> = T & { __memo: true };

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries.
 *
 * IMPORTANT! You MUST wrap the query/reference with the `useMemoFirebase` hook,
 * or the hook will enter an infinite loop.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {Memoized<CollectionReference | Query> | null | undefined} memoizedTargetRefOrQuery -
 * The memoized Firestore CollectionReference or Query.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: Memoized<CollectionReference<DocumentData> | Query<DocumentData>>  | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (memoizedTargetRefOrQuery && !('__memo' in memoizedTargetRefOrQuery)) {
      console.error('useCollection received a query or reference that was not created with useMemoFirebase. This will cause infinite loops.');
      setError(new Error('useCollection query must be memoized with useMemoFirebase.'));
      setIsLoading(false);
      return;
    }

    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const path: string =
          memoizedTargetRefOrQuery.type === 'collection'
            ? (memoizedTargetRefOrQuery as CollectionReference).path
            : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString()

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}
