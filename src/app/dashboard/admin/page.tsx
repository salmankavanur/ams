// src/app/dashboard/admin/page.tsx
'use client';

import React, { useEffect } from 'react';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';

export default function AdminDashboardPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  // Debug function to log the current auth state
  const logAuthState = () => {
    console.log("ADMIN DASHBOARD PAGE - Auth State:", {
      user: user?.uid,
      userDataExists: !!userData,
      userRole: userData?.role,
      loading
    });
  };
  
  useEffect(() => {
    // Log authentication state for debugging
    logAuthState();
    
    // If user is not authenticated, redirect to login
    if (!loading && !user) {
      console.log("User not authenticated, redirecting to login");
      router.push('/login');
      return;
    }
    
    // If user is not an admin, redirect to user dashboard
    if (!loading && userData && userData.role !== 'admin') {
      console.log("User is not admin, redirecting to user dashboard. Role:", userData.role);
      router.push('/dashboard/user');
    }
  }, [user, userData, loading, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (!user || !userData) {
    console.log("No user or userData, rendering null (will be redirected)");
    return null; // Will be redirected by the useEffect
  }
  
  // Double-check role before rendering admin dashboard
  if (userData.role !== 'admin') {
    console.log("User doesn't have admin role, rendering null. Role:", userData.role);
    return null; // Will be redirected by the useEffect
  }
  
  console.log("Rendering AdminDashboard component");
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <AdminDashboard />
      </div>
    </div>
  );
}