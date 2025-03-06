// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber as _signInWithPhoneNumber, 
  ConfirmationResult,
  signOut as _signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { AuthContextType, UserData, UserRole } from '@/types';
import { UserModel } from '@/types/mongo';
import Cookies from 'js-cookie';

// Mock user roles for development/testing
// IMPORTANT: Replace this with your actual Firebase UID to test admin access
const mockUserRoles: Record<string, UserRole> = {
  // Add your Firebase UID here to make yourself an admin for testing
  'idEZZyVbMRQGUSXqfLEr04ai4D92': 'admin', // Replace this with your actual Firebase UID  // Keep this as an example
};

const defaultUserRole: UserRole = 'user';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, authLoading, authError] = useAuthState(auth);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Debug function
  const logAuthState = () => {
    console.log("AUTH STATE:", {
      user: user?.uid,
      userData,
      userRole: userData?.role,
      authLoading, 
      loading,
      cookieToken: Cookies.get('authToken'),
      cookieRole: Cookies.get('userRole')
    });
  };

  const setUpRecaptcha = (elementId: string) => {
    if (window && typeof window !== 'undefined') {
      try {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
        }
        window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
          'size': 'invisible',
          'callback': () => {
            console.log("reCAPTCHA verified successfully");
          },
          'expired-callback': () => {
            setError(new Error('reCAPTCHA expired. Please try again.'));
          }
        });
      } catch (error) {
        console.error("Error setting up reCAPTCHA:", error);
        setError(new Error('Failed to set up verification. Please try again.'));
      }
    }
  };

  const signInWithPhoneNumber = async (phoneNumber: string) => {
    try {
      setError(null);
      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA not set up');
      }
      const result = await _signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(result);
      return result;
    } catch (err: any) {
      console.error("Error in signInWithPhoneNumber:", err);
      setError(err);
      throw err;
    }
  };

  const confirmOTP = async (otp: string) => {
    try {
      setError(null);
      
      // Development mode bypass for testing
      if (process.env.NODE_ENV === "development" && otp === "123456") {
        console.log("Development mode: Simulating successful OTP verification");
        
        // Create a mock user for development testing
        const mockUser = {
          uid: 'dev-test-user-id', // You can replace this with any test ID
          phoneNumber: '+15555555555',
          displayName: 'Test User',
          photoURL: null,
        };
        
        // Force admin role for testing in development mode
        const role: UserRole = 'admin'; // Force admin role for testing
        
        const newUserData = {
          uid: mockUser.uid,
          phoneNumber: mockUser.phoneNumber,
          role: role,
          displayName: mockUser.displayName,
          photoURL: mockUser.photoURL,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        setUserData(newUserData);
        
        // Set cookies for middleware
        Cookies.set('authToken', mockUser.uid, { expires: 7 });
        Cookies.set('userRole', role, { expires: 7 });
        
        console.log("Development login successful with role:", role);
        logAuthState();
        
        return { user: mockUser };
      }
      
      // Regular OTP confirmation flow
      if (!confirmationResult) {
        throw new Error('No confirmation result available');
      }
      
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      console.log("OTP confirmed for user:", user.uid);

      try {
        // Try to get user from MongoDB
        const response = await fetch('/api/auth/user?uid=' + user.uid);
        
        if (response.ok) {
          const mongoUser: UserModel = await response.json();
          console.log("User data from MongoDB:", mongoUser);
          
          // Set user data from MongoDB
          const newUserData: UserData = {
            uid: mongoUser.uid,
            phoneNumber: mongoUser.phoneNumber,
            role: mongoUser.role,
            displayName: mongoUser.displayName,
            photoURL: mongoUser.photoURL,
            createdAt: mongoUser.createdAt,
            updatedAt: mongoUser.updatedAt,
          };
          
          setUserData(newUserData);

          // Set cookies for middleware
          Cookies.set('authToken', user.uid, { expires: 7 });
          Cookies.set('userRole', newUserData.role || 'user', { expires: 7 });
        } else {
          // If user doesn't exist in MongoDB, create new user
          console.log("User not found in MongoDB, creating new user with mockRole");
          
          // Check if user should be admin (based on mockUserRoles)
          const role = mockUserRoles[user.uid] || defaultUserRole;
          console.log("Assigning role from mockUserRoles:", role, "for UID:", user.uid);
          
          const newUserData = {
            uid: user.uid,
            phoneNumber: user.phoneNumber,
            role: role,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          // Try to create the user in MongoDB
          const createResponse = await fetch('/api/auth/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUserData),
          });
          
          if (createResponse.ok) {
            console.log("User created in MongoDB successfully");
          } else {
            console.warn("Failed to create user in MongoDB, using local data only");
          }
          
          setUserData(newUserData);

          // Set cookies for middleware
          Cookies.set('authToken', user.uid, { expires: 7 });
          Cookies.set('userRole', role, { expires: 7 });
        }
      } catch (err) {
        console.error('Error handling user data after OTP confirmation:', err);
        
        // Fallback to mock roles if API calls fail
        const role = mockUserRoles[user.uid] || defaultUserRole;
        console.log("API error, falling back to mockUserRoles. Role:", role);
        
        const newUserData = {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          role: role,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        setUserData(newUserData);

        // Set cookies for middleware
        Cookies.set('authToken', user.uid, { expires: 7 });
        Cookies.set('userRole', role, { expires: 7 });
      }
      
      logAuthState();
      return result;
    } catch (err: any) {
      console.error("Error confirming OTP:", err);
      setError(err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await _signOut(auth);
      setUserData(null);
      Cookies.remove('authToken');
      Cookies.remove('userRole');
      console.log("User signed out successfully");
    } catch (err: any) {
      console.error("Error signing out:", err);
      setError(err);
      throw err;
    }
  };

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener");
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user?.uid);
      
      if (user) {
        try {
          // Fetch user data from MongoDB
          const response = await fetch(`/api/auth/user?uid=${user.uid}`);
          
          if (response.ok) {
            const mongoUser: UserModel = await response.json();
            console.log("User data fetched from MongoDB:", mongoUser);
            
            // Set user data from MongoDB
            const newUserData: UserData = {
              uid: mongoUser.uid,
              phoneNumber: mongoUser.phoneNumber,
              role: mongoUser.role,
              displayName: mongoUser.displayName,
              photoURL: mongoUser.photoURL,
              createdAt: mongoUser.createdAt,
              updatedAt: mongoUser.updatedAt,
            };
            
            setUserData(newUserData);

            // Set cookies if not already set
            if (!Cookies.get('authToken')) {
              Cookies.set('authToken', user.uid, { expires: 7 });
              Cookies.set('userRole', newUserData.role || 'user', { expires: 7 });
            }
          } else {
            // User not found in MongoDB, use mock roles
            console.log("User not found in MongoDB, using mockUserRoles");
            const role = mockUserRoles[user.uid] || defaultUserRole;
            console.log("Role from mockUserRoles:", role);
            
            const newUserData = {
              uid: user.uid,
              phoneNumber: user.phoneNumber,
              role: role,
              displayName: user.displayName,
              photoURL: user.photoURL,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            
            setUserData(newUserData);

            // Set cookies if not already set
            if (!Cookies.get('authToken')) {
              Cookies.set('authToken', user.uid, { expires: 7 });
              Cookies.set('userRole', role, { expires: 7 });
            }
          }
        } catch (err) {
          console.error('Error fetching user data from MongoDB:', err);
          
          // Fallback to mock roles if API fails
          const role = mockUserRoles[user.uid] || defaultUserRole;
          console.log("API error, falling back to mockUserRoles. Role:", role);
          
          const newUserData = {
            uid: user.uid,
            phoneNumber: user.phoneNumber,
            role: role,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          setUserData(newUserData);

          // Set cookies if not already set
          if (!Cookies.get('authToken')) {
            Cookies.set('authToken', user.uid, { expires: 7 });
            Cookies.set('userRole', role, { expires: 7 });
          }
        }
      } else {
        console.log("No user, clearing userData and cookies");
        setUserData(null);
        Cookies.remove('authToken');
        Cookies.remove('userRole');
      }
      
      setLoading(false);
      logAuthState();
    });

    return () => {
      console.log("Unsubscribing from auth state listener");
      unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    userData,
    loading: loading || authLoading,
    error: error || authError,
    signInWithPhoneNumber,
    confirmOTP,
    signOut,
    setUpRecaptcha,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}