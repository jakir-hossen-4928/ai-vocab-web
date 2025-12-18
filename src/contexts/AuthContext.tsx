import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

// Cache key for storing user role in localStorage
const ROLE_CACHE_KEY = 'user_role_cache';

// Get cached role from localStorage
const getCachedRole = (uid: string): string | null => {
  try {
    const cache = localStorage.getItem(ROLE_CACHE_KEY);
    if (cache) {
      const parsed = JSON.parse(cache);
      if (parsed.uid === uid && parsed.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
        // Cache valid for 24 hours
        return parsed.role;
      }
    }
  } catch (error) {
    console.error('Error reading role cache:', error);
  }
  return null;
};

// Save role to localStorage cache
const setCachedRole = (uid: string, role: string) => {
  try {
    localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify({
      uid,
      role,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error saving role cache:', error);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        // First, try to get cached role for instant load
        const cachedRole = getCachedRole(user.uid);
        if (cachedRole) {
          setIsAdmin(cachedRole === 'admin');
          setLoading(false);
        }

        try {
          const { setDoc, serverTimestamp } = await import('firebase/firestore');
          const userRef = doc(db, 'user_roles', user.uid);

          // Use getDoc with source option for offline support
          const roleDoc = await getDoc(userRef);

          // Data to update or set
          const userData = {
            email: user.email,
            photoURL: user.photoURL,
            displayName: user.displayName,
            lastLogin: serverTimestamp(),
          };

          if (!roleDoc.exists()) {
            // Create new user document
            await setDoc(userRef, {
              ...userData,
              role: 'user',
              createdAt: serverTimestamp()
            });
            setIsAdmin(false);
            setCachedRole(user.uid, 'user');
          } else {
            // Update existing user document with latest auth profile
            const role = roleDoc.data()?.role || 'user';

            // Update document in background (don't await to avoid blocking)
            setDoc(userRef, userData, { merge: true }).catch(err => {
              console.warn('Failed to update user data (offline?):', err);
            });

            setIsAdmin(role === 'admin');
            setCachedRole(user.uid, role);
          }
        } catch (error: any) {
          console.error('Error managing user_roles:', error);

          // Check if offline error
          const isOffline = error.code === 'unavailable' ||
            error.message?.includes('offline') ||
            error.message?.includes('network');

          if (isOffline) {
            console.warn('Operating in offline mode. Using cached role if available.');
            // Keep using cached role if we set it earlier
            if (!cachedRole) {
              setIsAdmin(false);
            }
          } else {
            // For other errors, default to user role
            setIsAdmin(false);
            setCachedRole(user.uid, 'user');
          }
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
