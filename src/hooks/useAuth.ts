// src/hooks/useAuth.ts
'use client';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

// Re-export the hook for consistency and to avoid direct imports from context
export const useAuth = () => {
  const authContext = useAuthContext();
  
  // Add debug logging when getting auth context
  console.log("useAuth hook called, current role:", authContext.userData?.role);
  
  return authContext;
};

// Helper functions for redirects based on auth state
export const getProtectedRouteRedirect = (
  isAuthenticated: boolean, 
  userRole: string | null, 
  pathname: string
): string | null => {
  console.log("getProtectedRouteRedirect:", { isAuthenticated, userRole, pathname });
  
  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    console.log("Not authenticated for protected route, redirecting to login");
    return '/login';
  }
  
  // If user is authenticated but trying to access wrong role dashboard
  if (isAuthenticated && pathname.startsWith('/dashboard')) {
    if (userRole === 'admin' && !pathname.includes('/admin')) {
      console.log("Admin accessing non-admin dashboard, redirecting to admin dashboard");
      return '/dashboard/admin';
    } 
    
    if (userRole === 'user' && pathname.includes('/admin')) {
      console.log("User accessing admin dashboard, redirecting to user dashboard");
      return '/dashboard/user';
    }
  }
  
  // If trying to access admin routes without admin role
  if (isAuthenticated && pathname.startsWith('/admin') && userRole !== 'admin') {
    console.log("Non-admin accessing admin route, redirecting to user dashboard");
    return '/dashboard/user';
  }
  
  // If user is authenticated and trying to access login page
  if (isAuthenticated && pathname === '/login') {
    console.log("Authenticated user accessing login page, redirecting to dashboard");
    return userRole === 'admin' ? '/dashboard/admin' : '/dashboard/user';
  }
  
  // No redirect needed
  console.log("No redirect needed");
  return null;
};