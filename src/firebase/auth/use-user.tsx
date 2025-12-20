
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

// Return type for useUser() - specific to user auth state
export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context for the user state
const UserContext = createContext<UserHookResult | undefined>(undefined);

/**
 * UserProvider manages and provides the current user's authentication state.
 * It listens to onAuthStateChanged and makes the user object available to its children.
 */
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth(); // Get the auth instance from the parent FirebaseProvider
  const [userState, setUserState] = useState<UserHookResult>({
    user: auth.currentUser, // Initialize with the current user, if any
    isUserLoading: true,   // Start in a loading state
    userError: null,
  });

  useEffect(() => {
    // If there's no auth instance, we can't determine the user.
    if (!auth) {
      setUserState({ user: null, isUserLoading: false, userError: new Error("Auth service not available.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // Auth state has been determined (user is either logged in or null)
        setUserState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        // An error occurred with the auth listener itself
        console.error("useUser: onAuthStateChanged error:", error);
        setUserState({ user: null, isUserLoading: false, userError: error });
      }
    );

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Re-run the effect if the auth instance changes

  return (
    <UserContext.Provider value={userState}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * It must be used within a UserProvider (which is nested inside FirebaseProvider).
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider.');
  }
  return context;
};
