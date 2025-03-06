// src/lib/auth-helpers.ts
import { NextRequest } from 'next/server';
import { getUserByUid } from './db-helpers';

interface AuthResult {
  isAuthenticated: boolean;
  uid?: string;
  role?: string | null;
}

// Verify authentication from cookies in the request
export async function verifyAuth(req: NextRequest): Promise<AuthResult> {
  // Get auth token from cookies
  const authToken = req.cookies.get('authToken')?.value;
  const userRole = req.cookies.get('userRole')?.value;
  
  if (!authToken) {
    return { isAuthenticated: false };
  }
  
  try {
    // Verify the token is valid by checking if the user exists in the database
    const user = await getUserByUid(authToken);
    
    if (!user) {
      return { isAuthenticated: false };
    }
    
    // Return authenticated result with user info
    return {
      isAuthenticated: true,
      uid: user.uid,
      role: user.role
    };
  } catch (error) {
    console.error('Error verifying authentication:', error);
    return { isAuthenticated: false };
  }
}