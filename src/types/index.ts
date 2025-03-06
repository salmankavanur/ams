// types.ts
import { User } from 'firebase/auth';

export interface FirebaseUser extends User {
  // Add any additional properties your app needs
}

export type UserRole = 'admin' | 'user' | null;

export interface UserData {
  uid: string;
  phoneNumber: string | null;
  role: UserRole;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface AuthContextType {
  user: FirebaseUser | null | undefined; // Allow undefined to match useAuthState
  userData: UserData | null;
  loading: boolean;
  error: Error | null | undefined; // Allow undefined to match useAuthState
  signInWithPhoneNumber: (phoneNumber: string) => Promise<any>;
  confirmOTP: (otp: string) => Promise<any>;
  signOut: () => Promise<void>;
  setUpRecaptcha: (elementId: string) => void;
}