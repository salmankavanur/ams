// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Debug logging
  console.log("Middleware executing for path:", request.nextUrl.pathname);
  
  const authCookie = request.cookies.get('authToken')?.value;
  const userRoleCookie = request.cookies.get('userRole')?.value;
  
  // Log cookie values to debug
  console.log("Auth cookie:", authCookie);
  console.log("Role cookie:", userRoleCookie);
  
  const pathname = request.nextUrl.pathname;
  
  // Check if the user is authenticated
  const isAuthenticated = !!authCookie;
  console.log("Is authenticated:", isAuthenticated);
  
  // Handle protected routes
  if (pathname.startsWith('/dashboard')) {
    console.log("Accessing dashboard route");
    
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Check if user has correct role for the dashboard
    if (userRoleCookie === 'admin' && pathname === '/dashboard/user') {
      console.log("Admin accessing user dashboard, redirecting to admin dashboard");
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    }
    
    if (userRoleCookie === 'user' && pathname === '/dashboard/admin') {
      console.log("User accessing admin dashboard, redirecting to user dashboard");
      return NextResponse.redirect(new URL('/dashboard/user', request.url));
    }
  }
  
  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    console.log("Accessing admin route");
    
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // If user is not an admin, redirect to user dashboard
    if (userRoleCookie !== 'admin') {
      console.log("Not admin, redirecting to user dashboard");
      return NextResponse.redirect(new URL('/dashboard/user', request.url));
    }
  }
  
  // Application routes protection - ensure authenticated
  if (pathname.startsWith('/application')) {
    console.log("Accessing application route");
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Redirect authenticated users away from login page
  if (pathname === '/login' && isAuthenticated) {
    console.log("Authenticated user at login page, redirecting to dashboard");
    const redirectPath = userRoleCookie === 'admin' ? '/dashboard/admin' : '/dashboard/user';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  
  // Continue with the request
  console.log("Middleware check passed, continuing to route");
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/application/:path*'],
};